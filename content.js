console.log("Content script loaded");

let targetLanguage = 'Hindi'; 


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "setLanguage") {
        targetLanguage = message.language;
        console.log("Language updated to:", targetLanguage);
    }
});

const observer = new MutationObserver(() => {
    setTimeout(() => {
        let chats = document.querySelectorAll('.copyable-text .selectable-text');
        let filteredChats = Array.from(chats).filter(chat => chat.tagName === 'P' || chat.tagName === 'SPAN');
    
        if (filteredChats.length > 0) {
            filteredChats.forEach(chat => {
                if (!chat.classList.contains('translated-listener')) {
                    let originalText = chat.innerText;

                    chat.addEventListener('click', async () => {
                        let translatedText = await translateText(originalText, targetLanguage);
                        
                        if (translatedText !== originalText) {
                            chat.innerText = translatedText;
                            chat.classList.add('translated');
                        } else {
                            chat.innerText = originalText;
                            chat.classList.remove('translated');
                        }
                    });

                    chat.classList.add('translated-listener');
                }
            });
        }
    }, 3000);
});

observer.observe(document.body, { childList: true, subtree: true });

async function translateText(text, targetLang) {
    try {
        const response = await fetch('http://127.0.0.1:5000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: text,
                source: "auto",
                target: targetLang
            })
        });

        const data = await response.json();
        return data.translatedText || text;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
}

