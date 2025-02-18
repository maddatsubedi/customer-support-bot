await channel.permissionOverwrites?.edit(muteRoleId, {
    SendMessages: false,
    Speak: false,
    AddReactions: false,
    Stream: false,
    AttachFiles: false,
    EmbedLinks: false,
    UseApplicationCommands: false,
}).catch((error) => {
    console.log("Caught Error in Permission Overwrite");
});