module.exports = {
    name: "move",
    description: "Move files to a specified folder (Owner only)",
    category: "utility",
    usage: "move <source_file> <destination_folder>",
    ownerOnly: true,
    async execute(client, message, args) {
        // Owner-only check is handled by messageCreate.js
        // No additional permission check needed
    }
}