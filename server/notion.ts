import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {

    // Array to store the child databases
    const childDatabases = [];

    try {
        // Query all child blocks in the specified page
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: NOTION_PAGE_ID,
                start_cursor: startCursor,
            });

            // Process the results
            for (const block of response.results) {
                // Check if the block is a child database
                if (block.type === "child_database") {
                    const databaseId = block.id;

                    // Retrieve the database title
                    try {
                        const databaseInfo = await notion.databases.retrieve({
                            database_id: databaseId,
                        });

                        // Add the database to our list
                        childDatabases.push(databaseInfo);
                    } catch (error) {
                        console.error(`Error retrieving database ${databaseId}:`, error);
                    }
                }
            }

            // Check if there are more results to fetch
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }

        return childDatabases;
    } catch (error) {
        console.error("Error listing child databases:", error);
        throw error;
    }
}

// Find get a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        if (db.title && Array.isArray(db.title) && db.title.length > 0) {
            const dbTitle = db.title[0]?.plain_text?.toLowerCase() || "";
            if (dbTitle === title.toLowerCase()) {
                return db;
            }
        }
    }

    return null;
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title: string, properties: any) {
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
        return existingDb;
    }
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: NOTION_PAGE_ID
        },
        title: [
            {
                type: "text",
                text: {
                    content: title
                }
            }
        ],
        properties
    });
}

// Get all transactions from the Notion database
export async function getTransactionsFromNotion(transactionsDatabaseId: string) {
    try {
        const response = await notion.databases.query({
            database_id: transactionsDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            // Handle various possible property names and types flexibly
            const getTextContent = (prop: any) => {
                if (!prop) return null;
                if (prop.title?.[0]?.plain_text) return prop.title[0].plain_text;
                if (prop.rich_text?.[0]?.plain_text) return prop.rich_text[0].plain_text;
                return null;
            };

            const getSelectValue = (prop: any) => {
                return prop?.select?.name || null;
            };

            const getNumberValue = (prop: any) => {
                return prop?.number?.toString() || "0";
            };

            const getDateValue = (prop: any) => {
                return prop?.date?.start || new Date().toISOString();
            };

            // Try different common property names for flexibility
            const description = getTextContent(properties.Name) || 
                              getTextContent(properties.Title) || 
                              getTextContent(properties.Description) || 
                              "Untitled Transaction";

            return {
                notionId: page.id,
                date: getDateValue(properties.Date) || getDateValue(properties.Created),
                description: description,
                amount: getNumberValue(properties.Amount) || getNumberValue(properties.Cost) || getNumberValue(properties.Price),
                category: getSelectValue(properties.Category) || getSelectValue(properties.Type),
                paymentMethod: getSelectValue(properties["Payment Method"]) || 
                             getSelectValue(properties.PaymentMethod) || 
                             getSelectValue(properties.Method),
                merchant: getTextContent(properties.Merchant) || getTextContent(properties.Store) || getTextContent(properties.Vendor),
                notes: getTextContent(properties.Notes) || getTextContent(properties.Comments),
            };
        });
    } catch (error) {
        console.error("Error fetching transactions from Notion:", error);
        throw new Error("Failed to fetch transactions from Notion");
    }
}
