// Handler para los botones Reclamar y Cerrar en tickets
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ticketsPath = path.join(__dirname, '../../data/tickets.json');

function loadTickets() {
    if (!fs.existsSync(ticketsPath)) return [];
    return JSON.parse(fs.readFileSync(ticketsPath));
}
function saveTickets(tickets) {
    fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2));
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Botón Reclamar
        if (interaction.isButton() && interaction.customId === 'ticket_claim') {
            const staffRoleId = '1402426944796233750'; // <-- Cambia esto por el ID real de tu rol staff
            if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Solo el staff puede reclamar tickets.', ephemeral: true });
            }
            const channel = interaction.channel;
            let tickets = loadTickets();
            let ticket = tickets.find(t => t.channelId === channel.id);
            if (!ticket) return interaction.reply({ content: 'No se encontró el ticket.', ephemeral: true });
            if (ticket.claimedBy) return interaction.reply({ content: 'Este ticket ya fue reclamado.', ephemeral: true });
            ticket.claimedBy = interaction.user.id;
            ticket.status = 'en progreso';
            saveTickets(tickets);
            // Permisos: solo el staff que reclama, admins y usuario creador
            await channel.permissionOverwrites.set([
                {
                    id: channel.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: ticket.userId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                {
                    id: staffRoleId,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
            ]);
            await interaction.reply({ content: `Ticket reclamado por <@${interaction.user.id}>. El sera el que te atendera!`, ephemeral: false });
        }
        // Botón Cerrar
        if (interaction.isButton() && interaction.customId === 'ticket_close') {
            const staffRoleId = '1402426944796233750'; // <-- Cambia esto por el ID real de tu rol staff
            if (!interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Solo el staff puede cerrar tickets.', ephemeral: true });
            }
            const channel = interaction.channel;
            let tickets = loadTickets();
            let ticket = tickets.find(t => t.channelId === channel.id);
            if (!ticket) return interaction.reply({ content: 'No se encontró el ticket.', ephemeral: true });
            ticket.status = 'cerrado';
            ticket.closedBy = interaction.user.id;
            ticket.closedAt = Date.now();
            saveTickets(tickets);
            // Generar transcript HTML
            const discordTranscripts = require('discord-html-transcripts');
            try {
                const attachment = await discordTranscripts.createTranscript(channel, {
                    limit: -1,
                    returnBuffer: true,
                    fileName: `transcript-${channel.id}.html`
                });
                const user = await client.users.fetch(ticket.userId);
                await user.send({
                    content: `Tu ticket fue cerrado por **<@${interaction.user.id}>.**\n\nAdjunto el transcript de la conversación:`,
                    files: [attachment]
                });
            } catch (e) {}
            await interaction.reply({ content: 'Ticket cerrado. El transcript fue enviado al usuario!', ephemeral: false });
            setTimeout(() => channel.delete().catch(() => {}), 5000);
        }
    }
};
