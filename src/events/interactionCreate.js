module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Primero, manejar el botón de verificación
        if (interaction.isButton() && interaction.customId === 'verificar_btn') {
            const { getConfig } = require('../utils/guildConfig');
            const config = getConfig(interaction.guild.id);
            // Soporte para múltiples roles de verificación
            const roles = config.verificarRoles || (config.verificarRole ? [config.verificarRole] : []);
            if (!roles.length) return interaction.reply({ content: 'No hay roles de verificación configurados.', ephemeral: true });
            const missingRoles = roles.filter(roleId => !interaction.guild.roles.cache.has(roleId));
            if (missingRoles.length === roles.length) return interaction.reply({ content: 'Ninguno de los roles de verificación existe.', ephemeral: true });
            try {
                // Solo asignar los roles que existen
                const validRoles = roles.filter(roleId => interaction.guild.roles.cache.has(roleId));
                await interaction.member.roles.add(validRoles);
                await interaction.user.send('¡Has sido verificado, disfruta de tu estancia');
                await interaction.reply({ content: '¡Verificación exitosa! Bienvenido!', ephemeral: true });
            } catch (err) {
                console.error('Error al asignar los roles de verificación:', err);
                await interaction.reply({ content: 'No se pudieron asignar los roles. Contacta a un admin.', ephemeral: true });
            }
            return;
        }

        // Handler para botones de autoroles
        if (interaction.isButton() && interaction.customId.startsWith('autorole_')) {
            const { getConfig } = require('../utils/guildConfig');
            const config = getConfig(interaction.guild.id);
            const autoroles = config.autoroles || [];
            const roleId = interaction.customId.replace('autorole_', '');
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return interaction.reply({ content: 'El rol ya no existe.', ephemeral: true });
            const hasRole = interaction.member.roles.cache.has(roleId);
            try {
                if (hasRole) {
                    await interaction.member.roles.remove(role);
                    await interaction.reply({ content: `Rol ${role.name} removido.`, ephemeral: true });
                } else {
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: `Rol ${role.name} asignado.`, ephemeral: true });
                }
            } catch (err) {
                await interaction.reply({ content: 'No se pudo modificar el rol. Contacta a un admin.', ephemeral: true });
            }
            return;
        }

        // Luego, manejar slash commands
        if (!interaction.isChatInputCommand()) return;
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        try {
            command.executeSlash(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Hubo un error ejecutando el comando.', ephemeral: true });
        }
    }
};
