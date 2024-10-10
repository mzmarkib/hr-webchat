// Optimized and Refactored Chat Application Implementation
!(function (TynApp) {
    "use strict";

    // Utility function to simplify element selection and iteration
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
    const $ = (selector, context = document) => context.querySelector(selector);

    // Throttle function to optimize repeated event listeners
    const throttle = (func, limit) => {
        let inThrottle;
        return function () {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    };

    // Function to set the active link based on the current URL
    TynApp.ActiveLink = function (selector, active) {
        const currentURL = document.location.href.split(/[?#]/)[0];
        $$(`${selector}`).forEach(item => {
            const selfLink = item.getAttribute('href');
            if (currentURL.includes(selfLink)) {
                item.parentElement.classList.add(...active);
            } else {
                item.parentElement.classList.remove(...active);
            }
        });
    };

    // Function to set the height of the appbar as a CSS variable
    TynApp.Appbar = function () {
        const appbarElm = $('.tyn-appbar');
        if (appbarElm) {
            const appbarHeight = `${appbarElm.offsetHeight}px`;
            document.documentElement.style.setProperty('--appbar-height', appbarHeight);
        }
    };

    // Chat-related functionality
    TynApp.Chat = {
        reply: {
            // Toggle the visibility of the chat search field
            search() {
                $$('.js-toggle-chat-search').forEach(item => {
                    item.addEventListener('click', e => {
                        e.preventDefault();
                        $('#tynChatSearch').classList.toggle('active');
                    });
                });
            },

            // Scroll to the end of chat content
            scroll() {
                $$('.js-scroll-to-end').forEach(item => {
                    const simpleBody = new SimpleBar(item);
                    const height = $('.simplebar-content > *', item).scrollHeight;
                    simpleBody.getScrollElement().scrollTop = height;
                });
            },

            // Focus the chat input field on load
            input() {
                $('#tynChatInput')?.focus();
            },

            // Toggle the quick chat feature
            quick() {
                $$('.js-toggle-quick').forEach(item => {
                    item.addEventListener('click', e => {
                        e.preventDefault();
                        $('#tynQuickChat').classList.toggle('active');
                    });
                });
            },

            // Handle sending chat messages
            send(chatMessage = null) {
                const chatSend = $('#tynChatSend');
                const chatInput = $('#tynChatInput');
                const chatBody = $('#tynChatBody');

                if (chatSend) {
                    chatSend.addEventListener("click", async (event) => {
                        event.preventDefault();
                        const getInput = chatMessage || chatInput.innerText.trim();
                        if (!getInput) return;

                        // Render the user's chat bubble
                        TynApp.Chat.renderChatBubble(getInput, true);
                        chatInput.innerHTML = "";
                        scrollToBottom(chatBody);

                        try {
                            chatSend.disabled = true;
                            // Send the message to the chatbot API
                            const replyBody = await TynApp.Chat.sendMessage(getInput);
                            if (replyBody) TynApp.Chat.handleReply(replyBody);
                        } catch (error) {
                            console.error('Error sending message:', error);
                        } finally {
                            chatSend.disabled = false;
                        }
                    });

                    // Send message on pressing Enter key
                    chatInput?.addEventListener("keypress", (event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            chatSend.click();
                        }
                    });
                }
            }
        },

        // Render a chat bubble in the chat UI
        renderChatBubble(message, isOutgoing = false) {
            const chatReply = $('#tynReply');
            const avatarUrl = TynApp.chatbotConfig?.chatbotConfig?.theme?.avatarUrl ?? "https://traicie.com/app/uploads/2023/10/traicie-multimatch-vacancies.gif";
            const chatItem = `
          <div class="tyn-reply-item ${isOutgoing ? 'outgoing' : 'incoming'} gap-2">
            ${isOutgoing ? '' : `<div class="tyn-qa-avatar"><div class="tyn-media tyn-size-md"><img src="${avatarUrl}" alt=""></div></div>`}
            <div class="tyn-reply-group">
              <div class="tyn-reply-bubble">
                <div class="tyn-reply-text">
                  ${message}
                </div>
              </div>
            </div>
          </div>
        `;
            chatReply.insertAdjacentHTML('afterbegin', chatItem);
            scrollToBottom($('#tynChatBody'));
        },

        // Send a message to the chatbot API
        async sendMessage(messageInput) {
            const chatSend = $('#tynChatSend');
            const starterPromptsWrapper = $('.starter-prompts-wrapper');

            chatSend.disabled = true;
            starterPromptsWrapper.innerHTML = "";
            disableRefreshButtons();

            try {
                const chatId = TynApp.Chat.getChatId();
                let retryCount = 0;
                const maxRetries = 3;
                let data;

                do {
                    TynApp.Chat.typingBubble(true);

                    // Send the message to the chatbot API
                    const response = await fetch(`https://ai.hr-chatbot.traicie.com/api/v1/prediction/${TynApp.chatbotConfig.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: messageInput, chatId })
                    });

                    if (!response.ok) throw new Error('Network response was not ok');
                    data = await response.json();
                    TynApp.Chat.typingBubble(false);

                    if (!data.text?.toLowerCase().includes('thread id:')) break;
                    retryCount++;
                } while (retryCount < maxRetries);

                if (retryCount === maxRetries) throw new Error('Max retries reached');

                return data;
            } catch (error) {
                console.error('Error sending message:', error);
                return false;
            } finally {
                chatSend.disabled = false;
                enableRefreshButtons();
            }
        }
    };

    // Scroll the specified element to the bottom
    function scrollToBottom(element) {
        const simpleBody = SimpleBar.instances.get(element);
        if (simpleBody) {
            const scrollElement = simpleBody.getScrollElement();
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }

    // Disable refresh buttons in the chat UI
    function disableRefreshButtons() {
        $$('.btn-refresh').forEach(btn => btn.disabled = true);
    }

    // Enable refresh buttons in the chat UI
    function enableRefreshButtons() {
        $$('.btn-refresh').forEach(btn => btn.disabled = false);
    }

    // Initialize custom elements and event listeners for the chat application
    TynApp.Custom.init = async function () {
        await TynApp.loadConfig();
        Object.values(TynApp.Chat.reply).forEach(func => typeof func === 'function' && func());
        TynApp.ActiveLink('.tyn-appbar-link', ['active', 'current-page']);
        TynApp.Appbar();
        TynApp.Theme();
    };

    // Initialize the application and load necessary plugins and resize events
    TynApp.init = function () {
        TynApp.Load(TynApp.Custom.init);
        TynApp.Load(TynApp.Plugins.init);
        TynApp.Resize(throttle(TynApp.Appbar, 200));
    };

    TynApp.init();
    return TynApp;
})(TynApp);