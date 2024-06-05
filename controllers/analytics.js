const Message = require("../models/Message");

exports.messages = async (req, res) => {
    try {
        const allMessage = await Message.find({});

        const months = new Array(12).fill(-1);

        allMessage.forEach(message => {
            // Extract the creation date of the message.
            const date = new Date(message.createdAt);
    
            // Get the month from the date (0-based index: January is 0, December is 11).
            const month = date.getMonth();
    
            // If this is the first message in this month, initialize the count to 0.
            if (months[month] === -1) {
                months[month] = 0;
            }
    
            // Increment the count for the corresponding month.
            months[month]++;
        });

        console.log(months)


        res.json(months)
    } catch (error) {

    }
}

exports.messagesTypes = async (req, res) => {
    try {
        const allMessage = await Message.find({});
        const months = new Array(12).fill(-1);
        // ["Text", "Media", "Document"]
        allMessage.forEach(message => {

            const type = message.type;
            if (type == "Text") months[0]++;
            else if (type == "Media") months[1]++;
            else months[2]++;
        });

        res.json(months)



        res.json()
    } catch (error) {

    }
}