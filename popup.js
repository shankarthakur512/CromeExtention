// Store the selected language in chrome storage when the user changes it
document.getElementById('language').addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    
    // Save the selected language in Chrome storage
    chrome.storage.sync.set({ targetLanguage: selectedLanguage }, () => {
        console.log('Language set to:', selectedLanguage);

        // Send the message to the content script to update the language
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "setLanguage",
                language: selectedLanguage
            }, (response) => {
                console.log("Language change message sent:", response);
            });
        });
    });
});

  

  document.getElementById('send').addEventListener('click', async () => {
      let message = document.getElementById('message').value;
      
     
      let lang = document.getElementById('language').value;
    let translatedMessage = await translateText(message, lang);
  
      let messageBox = await getMessageBoxWithRetry();
  
      if (messageBox) {
          
          messageBox.innerText = translatedMessage;
          
          
          messageBox.dispatchEvent(new Event('input', { bubbles: true }));
  
          let event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
          messageBox.dispatchEvent(event);
      } else {
          console.error("Message box not found.");
      }
  });
  
  
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

  
  
  function getMessageBoxWithRetry(attempts = 10, delay = 1000) {
      return new Promise((resolve, reject) => {
          function tryGetMessageBox(attempt) {
              let messageBox = document.querySelector('div[contenteditable="true"][role="textbox"][data-tab="10"]');
              if (messageBox) {
                  resolve(messageBox);
              } else if (attempt < attempts) {
                  setTimeout(() => tryGetMessageBox(attempt + 1), delay);
              } else {
                  reject("Message box not found after multiple attempts");
              }
          }
          tryGetMessageBox(0);
      });
  }
  