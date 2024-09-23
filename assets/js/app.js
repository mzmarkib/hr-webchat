!(function (TynApp) {
  "use strict";

  // Active Link
  TynApp.ActiveLink = function (selector, active) {
    let elm = document.querySelectorAll(selector);
    let currentURL = document.location.href,
      removeHash = currentURL.substring(0, (currentURL.indexOf("#") == -1) ? currentURL.length : currentURL.indexOf("#")),
      removeQuery = removeHash.substring(0, (removeHash.indexOf("?") == -1) ? removeHash.length : removeHash.indexOf("?")),
      fileName = removeQuery;

    elm && elm.forEach(function (item) {
      var selfLink = item.getAttribute('href');
      if (fileName.match(selfLink)) {
        item.parentElement.classList.add(...active);
      } else {
        item.parentElement.classList.remove(...active);
      }
    })
  }

  TynApp.Appbar = function () {
    let elm = document.querySelector('.tyn-appbar');
    if (elm) {
      document.querySelector('.tyn-root').style.setProperty('--appbar-height', `${elm.offsetHeight}px`)
    }
  }

  TynApp.Chat = {
    reply: {
      // Chat Search field toggle
      search: function () {
        let elm = document.querySelectorAll('.js-toggle-chat-search');
        if (elm) {
          elm.forEach(item => {
            item.addEventListener('click', (e) => {
              e.preventDefault();
              document.getElementById('tynChatSearch').classList.toggle('active');
            })
          })
        }
      },
      // Chat Scroll to end
      scroll: function () {
        let elm = document.querySelectorAll('.js-scroll-to-end');
        if (elm) {
          elm.forEach(item => {
            let simpleBody = new SimpleBar(item);
            let height = item.querySelector('.simplebar-content > *').scrollHeight
            simpleBody.getScrollElement().scrollTop = height;
          })
        }
      },
      // Input focus on load
      input: function () {
        let chatInput = document.querySelector('#tynChatInput');
        if (chatInput) {
          chatInput.focus()
        }
      },
      // Quick chat toggle
      quick: function () {
        let elm = document.querySelectorAll('.js-toggle-quick');
        if (elm) {
          elm.forEach(item => {
            item.addEventListener('click', (e) => {
              e.preventDefault();
              document.getElementById('tynQuickChat').classList.toggle('active')
            })
          })
        }
      },
      // Chat message send example
      send: function (chatMessage = null) {
        let chatSend = document.querySelector('#tynChatSend');
        let chatInput = document.querySelector('#tynChatInput');
        let chatReply = document.querySelector('#tynReply');
        let chatBody = document.querySelector('#tynChatBody');
        let chatActions = ``

        chatSend && chatSend.addEventListener("click", async function (event) {
          event.preventDefault();

          // If chatMessage is not null, getInput is chatMessage else get chatInput.innerText 
          let getInput = chatMessage ? chatMessage : chatInput.innerText;
          if (getInput == "")
            return false;

          TynApp.Chat.renderChatBubble(getInput, true);

          chatInput.innerHTML = "";
          let simpleBody = SimpleBar.instances.get(document.querySelector('#tynChatBody'));
          let height = chatBody.querySelector('.simplebar-content > *').scrollHeight;
          simpleBody.getScrollElement().scrollTop = height;

          try {
            // disable contenteditable
            chatSend.setAttribute('disabled', 'disabled');
            // chatInput.removeAttribute('Contenteditable');

            // Send the getInput to the Flowise API
            let replyBody = await TynApp.Chat.sendMessage(getInput);

            TynApp.Chat.handleReply(replyBody);

          } catch (error) {
            console.error('Error sending message:', error);
          }
        });

        chatInput && chatInput.addEventListener("keypress", function (event) {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            chatSend.click();
          }
        });


      }
    },
    sendOption: async function (chatMessage = null) {
      let chatSend = document.querySelector('#tynChatSend');
      let chatInput = document.querySelector('#tynChatInput');
      let chatReply = document.querySelector('#tynReply');
      let chatBody = document.querySelector('#tynChatBody');

      // If chatMessage is not null, getInput is chatMessage else get chatInput.innerText 
      let getInput = chatMessage ? chatMessage : chatInput.innerText;
      if (getInput == "")
        return false;

      let chatBubble = `
          <div class="tyn-reply-bubble">
              <div class="tyn-reply-text">
                  ${getInput}
              </div>
          </div>
        `;

      let outgoingWrapper = `
          <div class="tyn-reply-item outgoing">
            <div class="tyn-reply-group"></div>
          </div>
        `;

      // Check if there is an outgoing message already
      let replyItem = chatReply.querySelector('.tyn-reply-item');
      if (replyItem && !replyItem.classList.contains('outgoing')) {
        if (getInput !== "") {
          chatReply.insertAdjacentHTML("afterbegin", outgoingWrapper);
          chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
        }
      } else {
        if (getInput !== "") {
          chatReply.querySelector('.tyn-reply-item .tyn-reply-group').insertAdjacentHTML("beforeend", chatBubble);
        }
      }

      chatInput.innerHTML = "";
      let simpleBody = SimpleBar.instances.get(document.querySelector('#tynChatBody'));
      let height = chatBody.querySelector('.simplebar-content > *').scrollHeight;
      simpleBody.getScrollElement().scrollTop = height;

      try {
        // disable contenteditable
        chatSend.setAttribute('disabled', 'disabled');

        // Send the getInput to the Flowise API
        let replyBody = await TynApp.Chat.sendMessage(getInput);


        TynApp.Chat.handleReply(replyBody);
      } catch (error) {
        console.error('Error sending message:', error);
      }

    },
    botTyping: function (status = true) {
      // TODO: Implement bot typing indicator
    },
    renderChatBubble: function (message, isOutgoing = false) {
      let chatReply = document.querySelector('#tynReply');
      let avatarUrl = TynApp.chatbotConfig.chatbotConfig.theme.avatarUrl ? TynApp.chatbotConfig.chatbotConfig.theme.avatarUrl : "https://traicie.com/app/uploads/2023/10/traicie-multimatch-vacancies.gif";
      let chatItem = `
        <div class="tyn-reply-item ${isOutgoing ? 'outgoing' : 'incoming'} gap-2">
          ${isOutgoing ? '' : '<div class="tyn-qa-avatar"><div class="tyn-media tyn-size-md"><img src="' + avatarUrl + '" alt=""></div></div>'}
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

      // Get the SimpleBar instance
      let simpleBody = SimpleBar.instances.get(document.querySelector('#tynChatBody'));
      // Check if simpleBody exists
      if (simpleBody) {
        // Scroll to the bottom
        let scrollElement = simpleBody.getScrollElement();
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    },
    renderMcqOptions: function (options) {
      let chatSend = document.querySelector('#tynChatSend');
      let chatInput = document.querySelector('#tynChatInput');

      // create html for the MCQ options ul>li>button
      let optionsHtml = `
        <ul class="tyn-list-inline gap-1">
          ${options.map((option, index) => `
            <li>
              <button class="mcq-answer btn btn-white btn-md btn-pill" data-option="${index}">${option}</button>
            </li>
          `).join('')}
        </ul>
      `;
      chatInput.removeAttribute('contenteditable');
      chatSend.setAttribute('disabled', 'disabled');
      chatInput.innerHTML = optionsHtml;

      // on click of the MCQ option send the innerText to the send function
      let mcqAnswer = document.querySelectorAll('#tynChatInput .mcq-answer');

      mcqAnswer.forEach((answer) => {
        answer.addEventListener('click', async function (event) {
          let selectedOption = event.target;
          let selectedOptionText = selectedOption.innerText;

          TynApp.Chat.sendOption(selectedOptionText);

          // Enable editable content
          chatInput.innerHTML = "";
        });

      });


      // Get the SimpleBar instance
      let simpleBody = SimpleBar.instances.get(document.querySelector('#tynChatBody'));
      // Check if simpleBody exists
      if (simpleBody) {
        // Scroll to the bottom
        let scrollElement = simpleBody.getScrollElement();
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    },
    renderStarterPrompts: function (starterPrompts) {
      let starterPromptsWrapper = document.querySelector('.starter-prompts-wrapper');
      let chatInput = document.querySelector('#tynChatInput');

      starterPrompts = Object.values(starterPrompts).map((starterPrompt) => starterPrompt.prompt)

      // create html for the MCQ options ul>li>button
      let promptsHtml = `
        <div class="gth-starter-prompts py-3 px-4 d-flex gap-2 flex-wrap">
          
          ${starterPrompts.map((prompt, index) =>
        prompt ? `
              <button class="starter-prompt btn btn-white btn-md btn-pill">
                ${prompt}
              </button>
            ` : ''
      ).join('')}
        </div>
        <ul class="tyn-list-inline gap-1">
          
        </ul>
      `;
      starterPromptsWrapper.innerHTML = promptsHtml;

      // on click of the MCQ option send the innerText to the send function
      let starterPromptButtons = document.querySelectorAll('.gth-starter-prompts .starter-prompt');

      starterPromptButtons.forEach((button) => {
        button.addEventListener('click', async function (event) {
          let selectedPrompt = event.target;
          let selectedPromptText = selectedPrompt.innerText;

          TynApp.Chat.sendOption(selectedPromptText);

          // Enable editable content
          chatInput.innerHTML = "";
          starterPromptsWrapper.innerHTML = "";
        });

      });

      // Get the SimpleBar instance
      let simpleBody = SimpleBar.instances.get(document.querySelector('#tynChatBody'));
      // Check if simpleBody exists
      if (simpleBody) {
        // Scroll to the bottom
        let scrollElement = simpleBody.getScrollElement();
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    },
    typingBubble: function (status) {
      let chatReply = document.querySelector('#tynReply');
      let typingBubble = `
        <div class="tyn-reply-item incomming gap-2 typing-bubble">
          <div class="tyn-qa-avatar"><div class="tyn-media tyn-size-md"><img src="${TynApp.chatbotConfig.chatbotConfig.theme.avatarUrl ? TynApp.chatbotConfig.chatbotConfig.theme.avatarUrl : "https://traicie.com/app/uploads/2023/10/traicie-multimatch-vacancies.gif"}" alt=""></div></div>
          <div class="tyn-reply-group">
            <div class="tyn-reply-bubble">
              <div class="tyn-reply-text">
              </div>
            </div>
          </div>
        </div>
      `;

      if (status) {
        chatReply.insertAdjacentHTML('afterbegin', typingBubble);
      } else {
        let typingBubble = document.querySelector('.typing-bubble');
        typingBubble && typingBubble.remove();
      }

      // Get the SimpleBar instance
      let simpleBody = SimpleBar.instances.get(document.querySelector('#tynChatBody'));

      // Check if simpleBody exists
      if (simpleBody) {
        // Scroll to the bottom
        let scrollElement = simpleBody.getScrollElement();
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    },
    getChatId: function () {
      if (localStorage.chatId && localStorage.chatId !== 'undefined') {
        return localStorage.chatId;
      }

      // Generate a random unique chatId
      let chatId = "web_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.chatId = chatId;
      return chatId;


    },
    sendMessage: async function (messageInput) {

      // Disable the chatSend button
      let chatSend = document.querySelector('#tynChatSend');
      let starterPromptsWrapper = document.querySelector('.starter-prompts-wrapper');

      chatSend.setAttribute('disabled', 'disabled');
      starterPromptsWrapper.innerHTML = "";

      // Disable clear chat buttons
      document.querySelectorAll('.btn-refresh').forEach((element) => {
        element.setAttribute('disabled', 'disabled');
      });

      try {
        let chatId = TynApp.Chat.getChatId();
        let retryCount = 0;
        const maxRetries = 3; // Number of times to retry
        let data;

        // Retry mechanism loop
        do {
          setTimeout(() => {
            TynApp.Chat.typingBubble(true);
          }, 2000);

          // Send the input to the Flowise API
          const response = await fetch(`https://ai.hr-chatbot.traicie.com/api/v1/prediction/${TynApp.chatbotConfig.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: messageInput,
              chatId: chatId,
            }),
          });

          // Parse the JSON response
          data = await response.json();

          TynApp.Chat.typingBubble(false);

          // Check if the response contains an error, retry if so
          if (data.text && data.text.toLowerCase().includes('thread id:')) {
            retryCount++;
            console.warn(`Retrying... (${retryCount}/${maxRetries})`);
          } else {
            break; // Exit the loop if no error in the content
          }

        } while (retryCount < maxRetries);

        if (retryCount === maxRetries) {
          console.error('Max retries reached, returning error response.');

          // Enable the chatSend button
          chatSend.removeAttribute('disabled');
          // Enable clear chat buttons
          document.querySelectorAll('.btn-refresh').forEach((element) => {
            element.removeAttribute('disabled');
          });

          return false;
        }

        // Store the chatId in localStorage if necessary
        // localStorage.chatId = data.chatId ? data.chatId : data.assistant.threadId;

        return data;

      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    },
    handleReply: function (replyBody) {

      let parsedResponse = TynApp.Chat.parseResponse(replyBody.text);
      localStorage.setItem('sessionId', replyBody.assistant.threadId);

      // enable clear chat buttons
      document.querySelectorAll('.btn-refresh').forEach((element) => {
        element.removeAttribute('disabled')
      });

      switch (parsedResponse.type) {
        case "mcq":
          TynApp.Chat.mcqReply(parsedResponse);
          break;
        case "open-ended":
          TynApp.Chat.statementReply(parsedResponse);
          break;
        case "statement":
          TynApp.Chat.statementReply(parsedResponse);
          break;
        default:
          break;
      }
    },
    mcqReply: function (parsedResponse) {

      let chatSend = document.querySelector('#tynChatSend');

      TynApp.Chat.renderChatBubble(parsedResponse.text, false);

      // Render the MCQ options
      TynApp.Chat.renderMcqOptions(parsedResponse.options);


      // Disable the chatSend button
      chatSend.setAttribute('disabled', 'disabled');

    },
    statementReply: function (parsedResponse) {

      let chatSend = document.querySelector('#tynChatSend');
      let chatInput = document.querySelector('#tynChatInput');

      TynApp.Chat.renderChatBubble(parsedResponse.text, false);

      // enable chatSend button
      // enable contenteditable
      chatSend.removeAttribute('disabled');
      chatInput.setAttribute('Contenteditable', 'true');

    },
    parseResponse: function (response) {
      const mcqRegex = /\[MCQ\](.*?)\[\/MCQ\]/s;
      const mcaRegex = /\[MCA\](.*?)\[\/MCA\]/g;
      const oeqRegex = /\[OEQ\](.*?)\[\/OEQ\]/s;

      // Match and extract MCQ content
      const mcqMatch = response.match(mcqRegex);
      const oeqMatch = response.match(oeqRegex);

      if (mcqMatch) {
        // Extract question text and surrounding context
        let questionText = mcqMatch[1].trim();

        // Extract and remove MCA tags from the response to get the options
        let options = [];
        let optionMatch;
        while ((optionMatch = mcaRegex.exec(response)) !== null) {
          options.push(optionMatch[1].trim());
        }

        // Replace the entire MCQ block (including MCQ and MCA tags) with the question text
        let modifiedResponse = response.replace(mcqRegex, questionText);
        modifiedResponse = modifiedResponse.replace(mcaRegex, ''); // Remove the MCA tags

        return { type: "mcq", text: modifiedResponse.trim(), options };
      } else if (oeqMatch) {
        // Extract question text and replace the OEQ block with it
        let questionText = oeqMatch[1].trim();
        let modifiedResponse = response.replace(oeqRegex, questionText);

        return { type: "open-ended", text: modifiedResponse.trim() };
      } else {
        // If no MCQ or OEQ found, return as a statement
        return { type: "statement", text: response.trim() };
      }
    },
    renderPreviousMessages: async function () {

      const myHeaders = new Headers();
      myHeaders.append("Authorization", "Basic Sm9jaGVuOkBUcmFpY2llMjAyNA==");

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      await fetch(`https://ai.hr-chatbot.traicie.com/api/v1/chatmessage/${TynApp.chatbotConfig.id}?order=ASC&sessionId=${localStorage.sessionId}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let messages = JSON.parse(result);
          console.log(messages.length);
          let msgCounter = 0;
          messages.forEach((message) => {
            msgCounter++;
            let parsedMessage = TynApp.Chat.parseResponse(message.content);

            if (message.role === 'userMessage') {
              TynApp.Chat.renderChatBubble(parsedMessage.text, true);
            } else {
              if (parsedMessage.type === 'mcq') {
                TynApp.Chat.renderChatBubble(parsedMessage.text, false);

                // Render the MCQ options if it is the last message
                if (msgCounter === messages.length)
                  TynApp.Chat.renderMcqOptions(parsedMessage.options);
              } else {
                TynApp.Chat.renderChatBubble(parsedMessage.text, false);
              }
            }
          });
        })
        .catch((error) => console.error(error));
    },
    resetConversation: function () {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('chatId');

      const chatReply = document.querySelector('#tynReply');
      const chatInput = document.querySelector('#tynChatInput');
      const chatSend = document.querySelector('#tynChatSend');


      chatReply.innerHTML = "";
      chatInput.innerHTML = "";
      chatInput.setAttribute('contenteditable', 'true');
      chatSend.removeAttribute('disabled');
      TynApp.Chat.renderChatBubble(TynApp.chatbotConfig.chatbotConfig.welcomeMessage, false);

      if (TynApp.chatbotConfig.chatbotConfig.starterPrompts)
        TynApp.Chat.renderStarterPrompts(TynApp.chatbotConfig.chatbotConfig.starterPrompts);
    },
    // chat item active toggle
    item: function () {
      let elm = document.querySelectorAll('.js-toggle-main');
      if (elm) {
        elm.forEach(item => {
          item.addEventListener('click', (e) => {
            let isOption = e.target.closest('.tyn-aside-item-option');
            elm.forEach(item => {
              !isOption && item.classList.remove('active')
            })
            !isOption && item.classList.add('active');
            !isOption && document.getElementById('tynMain').classList.toggle('main-shown');
          })
        })
      }
    },
    // chat mute
    mute: function () {
      let muteToggle = document.querySelector('.js-chat-mute-toggle');
      let mute = document.querySelector('.js-chat-mute');
      const muteOptionsModal = muteToggle && new bootstrap.Modal('#muteOptions', {})
      if (muteToggle) {
        muteToggle.addEventListener('click', (e) => {
          e.preventDefault();
          if (!muteToggle.classList.contains('chat-muted')) {
            muteOptionsModal.show();
          } else {
            muteToggle.classList.remove('chat-muted');
          }
        })
      }
      if (mute) {
        mute.addEventListener('click', (e) => {
          e.preventDefault();
          muteOptionsModal.hide();
          muteToggle.classList.add('chat-muted');
        })
      }
    },
    // chat info toggle
    aside: function () {
      let elm = document.querySelector('.js-toggle-chat-options');
      if (elm) {
        let target = document.getElementById('tynChatAside');
        let chat = document.getElementById('tynMain');
        target.insertAdjacentHTML('beforebegin', `<div class="tyn-overlay js-toggle-chat-options" ></div>`);
        let overlay = document.querySelector('.tyn-overlay.js-toggle-chat-options');

        function asideshow() {
          elm.classList.add('active');
          target.classList.add('show-aside');
          chat.classList.add('aside-shown');
          if (TynApp.Page.Width < TynApp.Breakpoints.xl) {
            overlay.classList.add('active');
          }
        }
        function asidehide() {
          elm.classList.remove('active');
          target.classList.remove('show-aside');
          chat.classList.remove('aside-shown');
          if (TynApp.Page.Width < TynApp.Breakpoints.xl) {
            overlay.classList.remove('active');
          }
        }

        if (TynApp.Page.Width > TynApp.Breakpoints.xl) {
          asideshow();
        }

        elm.addEventListener('click', (e) => {
          e.preventDefault();
          if (!chat.classList.contains('aside-shown')) {
            asideshow();
          } else {
            asidehide()
          }
        })

        overlay.addEventListener('click', (e) => {
          e.preventDefault();
          asidehide();
        })

        const chatObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > TynApp.Breakpoints.xl) {
              overlay.classList.remove('active');
              chat.classList.remove('aside-collapsed');
            } else {
              setTimeout(() => {
                chat.classList.add('aside-collapsed');
              }, 1000);
            }

            if (entry.contentRect.width < TynApp.Breakpoints.xl) {
              if (!chat.classList.contains('aside-collapsed')) {
                asidehide();
              }

            }
          }
        });

        chatObserver.observe(TynApp.Body);
      }
    }
  }

  TynApp.Plugins = {
    // lightbox init
    lightbox: function () {
      const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: true
      });
    },
    // stories slider init (Swiper)
    slider: {
      stories: function () {
        let storiesThumb = document.querySelector('.tyn-stories-thumb');
        let storiesSlider = document.querySelector('.tyn-stories-slider');
        let autoplayDelay = 5000;
        storiesSlider && storiesSlider.querySelector('.swiper-pagination').style.setProperty("--slide-delay", `${autoplayDelay}ms`);
        const thumbCount = storiesThumb && storiesThumb.querySelectorAll('.swiper-slide').length;
        const thumb = new Swiper('.tyn-stories-thumb', {
          slidesPerView: 2,
          freeMode: true,
          cssMode: true,
          spaceBetween: 0,
          grid: {
            rows: thumbCount / 2,
          },
        });
        const main = new Swiper('.tyn-stories-slider', {
          speed: 400,
          spaceBetween: 0,
          slidesPerView: 1,
          effect: "fade",
          grabCursor: true,
          autoplay: {
            delay: autoplayDelay,
            disableOnInteraction: false,
            waitForTransition: false
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          thumbs: {
            swiper: thumb,
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
        });
      },
    },
    // clipboard js init
    clipboard: function () {
      let clipboardTrigger = document.querySelectorAll('.tyn-copy');
      let options = {
        tooltip: {
          init: 'Copy',
          success: 'Copied',
        }
      }
      clipboardTrigger.forEach(item => {
        //init clipboard
        let clipboard = new ClipboardJS(item);
        //set markup
        let initMarkup = `${options.tooltip.init}`;
        let successMarkup = `${options.tooltip.success}`;
        item.innerHTML = initMarkup;
        //on-sucess
        clipboard.on("success", function (e) {
          let target = e.trigger;
          target.innerHTML = successMarkup;
          setTimeout(function () {
            target.innerHTML = initMarkup;
          }, 1000)
        });
      });
    }
  }

  TynApp.Theme = async function () {
    // Set Theme Function
    function setMode(currentMode) {
      localStorage.setItem('connectme-html', currentMode);
      document.documentElement.setAttribute("data-bs-theme", currentMode);
    }
    // Set Theme On Load
    setMode(localStorage.getItem('connectme-html'));

    // Theme Mode Toggle
    // var themeModeToggle = document.getElementsByName('themeMode');
    // themeModeToggle.forEach((item) => {
    //   (item.value == localStorage.getItem('connectme-html')) && (item.checked = true);
    //   item.addEventListener('change', function () {
    //     if (item.checked && item.value) {
    //       setMode(item.value);
    //     }
    //   })
    // })

    // Load bot name
    document.querySelectorAll('h6.name, .agent_name').forEach((nameElement) => {
      nameElement.innerHTML = TynApp.chatbotConfig.chatbotConfig.title;
    });

    // Load Organization name
    // document.querySelector('.tyn-aside-title').innerHTML = TynApp.chatbotConfig.name;

    // Apply the theme colors
    const rootElement = document.documentElement;
    rootElement.style.setProperty('--org-primary-color', TynApp.chatbotConfig.chatbotConfig.theme.primaryColor);
    rootElement.style.setProperty('--org-primary-color-light', TynApp.chatbotConfig.chatbotConfig.theme.primaryColorLight);
    rootElement.style.setProperty('--org-secondary-color', TynApp.chatbotConfig.chatbotConfig.theme.secondaryColor);
    rootElement.style.setProperty('--org-muted-color', TynApp.chatbotConfig.chatbotConfig.theme.mutedColor);

    // change logo url to the one in the config
    document.querySelector('.tyn-appbar-logo .tyn-logo').innerHTML = `
      <img src="${TynApp.chatbotConfig.chatbotConfig.theme.orgLogoUrl ? TynApp.chatbotConfig.chatbotConfig.theme.orgLogoUrl : "https://traicie.com/app/uploads/2023/10/traicie-removebg-preview.png"}" />
    `;
    // change chat-head avatar url to the one in the config
    document.querySelectorAll('.tyn-chat-head .tyn-media').forEach((element) => {
      element.innerHTML = `
      <img src="${TynApp.chatbotConfig.chatbotConfig.theme.avatarUrl ? TynApp.chatbotConfig.chatbotConfig.theme.avatarUrl : "https://traicie.com/app/uploads/2023/10/traicie-multimatch-vacancies.gif"}" />
    `;
    })

    if (TynApp.chatbotConfig.chatbotConfig.welcomeMessage)
      TynApp.Chat.renderChatBubble(TynApp.chatbotConfig.chatbotConfig.welcomeMessage, false);

    // if continued conversation
    if (!localStorage.sessionId || localStorage.sessionId == 'undefined') {
      // render starter prompts
      if (TynApp.chatbotConfig.chatbotConfig.starterPrompts)
        TynApp.Chat.renderStarterPrompts(TynApp.chatbotConfig.chatbotConfig.starterPrompts);
    } else {
      await TynApp.Chat.renderPreviousMessages();
    }

    // reset conversation
    document.querySelectorAll('.btn-refresh').forEach((element) => {
      element.addEventListener('click', function () {
        TynApp.Chat.resetConversation();
      });
    });

    // Organization more link
    if (TynApp.chatbotConfig.chatbotConfig.theme.orgMoreLink) {
      document.querySelector('.org-more-link').setAttribute('href', TynApp.chatbotConfig.chatbotConfig.theme.orgMoreLink);
    } else {
      // remove the more link if it is not set
      document.querySelector('.tyn-aside-foot ul').removeChild(document.querySelector('.org-more-link').parentNode);
    }
  }

  TynApp.loadConfig = async function () {
    // Get the hash from the URL
    let hash = window.location.hash;

    // Redirect to 404 page if hash is empty
    if (!hash && !window.location.href.includes('404.html')) {
      window.location.href = './404.html';
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic Sm9jaGVuOkBUcmFpY2llMjAyNA==");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    await fetch(`https://ai.hr-chatbot.traicie.com/api/v1/public-chatflows/${hash.replace('#', "")}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        // Parse the main JSON object
        let parsedResult = JSON.parse(result);

        // Parse the chatbotConfig string into a JSON object
        if (parsedResult.chatbotConfig) {
          parsedResult.chatbotConfig = JSON.parse(parsedResult.chatbotConfig);
        }

        localStorage.setItem('chatbotConfig', JSON.stringify(parsedResult));
        TynApp.chatbotConfig = parsedResult;
        TynApp.initTranslate(parsedResult?.chatbotConfig?.theme?.language || 'english');
      })
      .catch((error) => {
        console.error(error);
        if (!window.location.href.includes('404.html')) {
          window.location.href = './404.html';
          return;
        }
      });
  };

  TynApp.initTranslate = function (language) {
    // convert language to lowercase
    const lowerCaseLanguage = language.toLowerCase();

    // load the translation json file
    fetch(`./assets/locales/${lowerCaseLanguage}.json`)
      .then(response => response.json())
      .then(data => {
        // translate the document
        document.querySelectorAll('[data-translate]').forEach(element => {
          const key = element.getAttribute('data-translate');
          element.innerHTML = data[key];
        });
      });
  }


  TynApp.Custom.init = async function () {
    await TynApp.loadConfig();
    TynApp.Chat.reply.search();
    TynApp.Chat.reply.scroll();
    TynApp.Chat.reply.input();
    TynApp.Chat.reply.quick();
    TynApp.Chat.reply.send();
    TynApp.Chat.item();
    TynApp.Chat.mute();
    // TynApp.Chat.aside(); //disable sidebar be default
    TynApp.ActiveLink('.tyn-appbar-link', ['active', 'current-page']);
    TynApp.Appbar();
    TynApp.Theme();
  }

  TynApp.Plugins.init = function () {
    TynApp.Plugins.lightbox();
    TynApp.Plugins.slider.stories();
    TynApp.Plugins.clipboard();
  }

  TynApp.init = function () {
    TynApp.Load(TynApp.Custom.init);
    TynApp.Load(TynApp.Plugins.init);
    TynApp.Resize(TynApp.Appbar);
  }

  TynApp.init();

  return TynApp;
})(TynApp);

//end-js