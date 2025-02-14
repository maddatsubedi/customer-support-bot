const db = require('../db');

const createTicketDmsTable = () => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ticket_dms (
            ticketId TEXT NOT NULL,
            agentId TEXT NOT NULL,
            messageId TEXT NOT NULL,
            PRIMARY KEY (ticketId, agentId)
        )
    `).run();
};

const insertTicketDm = (ticketId, agentId, messageId) => {
    db.prepare(`
        INSERT INTO ticket_dms (ticketId, agentId, messageId)
        VALUES (?, ?, ?)
        ON CONFLICT(ticketId, agentId) DO UPDATE SET messageId = excluded.messageId
    `).run(ticketId, agentId, messageId);
};

const getTicketDmsForTicket = (ticketId) => {
    return db.prepare(`SELECT * FROM ticket_dms WHERE ticketId = ?`).all(ticketId);
};

const deleteTicketDmsForTicket = (ticketId) => {
    db.prepare(`DELETE FROM ticket_dms WHERE ticketId = ?`).run(ticketId);
};

module.exports = {
    createTicketDmsTable,
    insertTicketDm,
    getTicketDmsForTicket,
    deleteTicketDmsForTicket
};
