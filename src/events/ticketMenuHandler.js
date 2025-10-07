// Handler para interacción del menú select de tickets
const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ticketsPath = path.join(__dirname, '../../data/tickets.json');

function saveTicket(ticket) {
    let data = [];
    if (fs.existsSync(ticketsPath)) data = JSON.parse(fs.readFileSync(ticketsPath));
    data.push(ticket);
    fs.writeFileSync(ticketsPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Handler para menú select de tickets
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            const motivo = interaction.values[0];
            const user = interaction.user;
            const guild = interaction.guild;
            // Puedes personalizar la categoría de los tickets aquí:
            const categoriaId = null; // Si quieres que los tickets se creen en una categoría específica, pon el ID aquí

            // Permisos: solo el usuario, staff y admins pueden ver el canal
            const staffRoleId = '1402426944796233750'; // <-- Cambia esto por el ID real de tu rol staff
            const adminPerms = [PermissionFlagsBits.Administrator];

            // Verificar si el usuario ya tiene un ticket abierto
            let data = [];
            if (fs.existsSync(ticketsPath)) data = JSON.parse(fs.readFileSync(ticketsPath));
            const yaAbierto = data.find(t => t.userId === user.id && t.status === 'abierto');
            if (yaAbierto) {
                return interaction.reply({ content: 'Ya tienes un ticket abierto. Debes cerrarlo antes de crear otro.', ephemeral: true });
            }

            // Determinar prefijo según motivo
            let prefix = 'ticket';
            if (motivo === 'bugs') prefix = 'bug';
            else if (motivo === 'compra') prefix = 'compra';
            else if (motivo === 'soporte') prefix = 'soporte';

            // Crear canal privado con prefijo personalizado
            const canal = await guild.channels.create({
                name: `${prefix}-${user.username}`,
                type: ChannelType.GuildText,
                parent: categoriaId || undefined,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: staffRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            });

            // Embed de ticket creado (puedes personalizarlo en código)
            const embed = new EmbedBuilder()
                .setTitle('TICKET CREADO CON EXITO')
                .setDescription(`Motivo: **${motivo}**\nUsuario: <@${user.id}>`)
                .setColor(0x57F287);

            // Botones: Cerrar y Reclamar
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Reclamar')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Cerrar')
                    .setStyle(ButtonStyle.Danger)
            );

            await canal.send({ embeds: [embed], components: [row] });

            // Guardar ticket en JSON
            saveTicket({
                channelId: canal.id,
                userId: user.id,
                motivo,
                status: 'abierto',
                claimedBy: null,
                createdAt: Date.now()
            });

            await interaction.reply({ content: `Ticket creado en ${canal}.`, ephemeral: true });
        }
    }
};
