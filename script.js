async function sendMessage(data) {
    try {
        const response = await fetch(
            "https://ai.hr-chatbot.traicie.com/api/v1/prediction/af68fbe6-4fe1-474c-a136-6961fd250762",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}



// Function to parse text response and return it as an object


document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("tynChatInput");
    const chatSendButton = document.querySelector(".btn-send");

    chatSendButton.addEventListener("click", function () {
        if (chatInput.textContent.trim() === "") return;

        sendMessage({ question: chatInput.textContent }).then(result => {
            console.log(parseResponse(result.text));
        });
    });
});
