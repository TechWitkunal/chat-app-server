const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require('mongodb');

// this function will return you jwt token
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// check email is valid or not (return true or false)
function isValidEmail(email) {
    try {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(email.toLowerCase());
    } catch (error) {
        return false;
    }
}

// check field is not only contain empty string or not null
function isValidString(str) {
    try {
        return str !== null && str.trim() !== '';
    } catch (error) {
        return false;
    }
}

// function filterMessages(obj, from, to) {
//     // console.log("new obj -------> ", obj, "<-------- new obj")
//     let newObj = [];
//     obj.forEach(message => {
//         if (message?.to?.toString() === to && message.from.toString() === from) { newObj.push(message); }
//         console.log(message.membersInGroup.length > 0, " <--")
//         else if (message.membersInGroup.length > 0) {
//             // const 
//         }
//         else {}
//     });
//     obj.forEach(message => {
//         if (message?.to?.toString() === from && message.from.toString() === to) { newObj.push(message); }
//     });
//     console.log("new obj -------> ", newObj, "<-------- new obj")
//     return newObj;
// }

function filterMessages(messages, from, to) {
    let filteredMessages = [];

    messages.forEach(message => {
        const messageTo = message?.to?.toString();
        const messageFrom = message.from?.toString();
        // console.log(message.fileUrl, "<--------file url");

        // Check if the message is between the specified from and to users
        if ((messageTo === to && messageFrom === from) || (messageTo === from && messageFrom === to)) {
            filteredMessages.push(message);
        }
        
        // Optional: Check if the message involves a group and handle accordingly
        else if (message.membersInGroup && message.membersInGroup.length > 0) {
            let isValid = false;
            // console.log(message, "<-- MESSAGE");
            message.membersInGroup.forEach(id => {
                if (id == from && message.groupId == to) { 
                    // 'from' of message == to id of user && 'groupid' of message == group id which user is requesting
                    isValid = true;
                }
            })
            if (isValid) { filteredMessages.push(message) }
        }
    });

    // console.log("Filtered messages -------> ", filteredMessages, "<-------- Filtered messages");
    return filteredMessages;
}


function getDayAndTime() {
    // Get current date
    const now = new Date();

    // Array to store result
    const result = [];

    // Get day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];

    // Get current time
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Convert hours to 12-hour format
    const amOrPm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    // Add leading zeros to minutes if needed
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    // Construct the time string
    const currentTime = `${hours}:${minutes} ${amOrPm}`;

    // Push day name and current time to the result array
    result.push(dayName);
    result.push(currentTime);

    return result;
}

const isValidUserIdInArray = (array) => {
    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] === 'number') { return false }
        if (!mongoose.Types.ObjectId.isValid(array[i])) {
            return false;
        }
    }
    return true;
}

const isValidMongooseId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
    }
    return true;
}

function convertIds(ids) {
    return ids.map(id => {
        // Convert ObjectId to string if it's an instance of ObjectId
        if (id instanceof ObjectId) {
            return id.toString();
        }
        // Return the string ID unchanged if it's already a string
        return id;
    });

    
}

function objectToArray(obj) {
    const array = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            array.push(obj[key]);
        }
    }
    return array;
}



module.exports = {
    isValidEmail: isValidEmail,
    isValidString: isValidString,
    filterMessages: filterMessages,
    getDayAndTime: getDayAndTime,
    isValidUserIdInArray: isValidUserIdInArray,
    isValidMongooseId: isValidMongooseId,
    objectToArray: objectToArray,
    convertIds: convertIds,
    signToken: signToken
};
