export interface ObsidianConfig {
    vaultPath: string; // Path to the Obsidian vault
    devLogsFolder: string; // Folder within the vault for development logs
    problemRecordsFolder: string; // Folder for storing problem records
    valueAssessmentsFolder: string; // Folder for value assessments
    namingConvention: string; // Naming convention for exported files
    tags: string[]; // Tags to be applied to exported notes
    enableAutoLinking: boolean; // Whether to enable automatic linking in Obsidian
}