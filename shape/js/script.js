document.addEventListener("DOMContentLoaded", function () {
  const waves = [
    document.getElementById("wave1"),
    document.getElementById("wave2"),
    document.getElementById("wave3"),
  ];

  let speaking = false;
  let reloadTimer;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;

  recognition.onresult = function (event) {
    const transcript = event.results[event.resultIndex][0].transcript
      .trim()
      .toLowerCase();
    if (transcript.includes("mds") || transcript.includes("hello")) {
      respond("Hey Savio! How can I assist you?");
    } else if (transcript.includes("how are you")) {
      respond(
        "I'm just a computer programmed by Savio, but I'm doing well. Thank you for asking!"
      );
    } else if (transcript.includes("email")) {
      const email = extractEmail(transcript);
      if (email) {
        respond(`Your email address is ${email}.`);
      } else {
        respond("Sorry, I couldn't find your email address.");
      }
    } else if (transcript.includes("time")) {
      const time = getCurrentTime();
      respond(`The current time is ${time}.`);
    } else {
      // Handle questions beyond predefined responses using Google Speech Recognition API
      sendToGoogleAPI(transcript);
    }
  };

  function respond(message) {
    if (!speaking) {
      speaking = true;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = function () {
        speaking = false;
        location.reload(); // Reload the page after speaking
      };
      window.speechSynthesis.speak(utterance);
    }
  }
  function extractEmail(text) {
    const emailRegex = /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
  }

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  }
  function sendToGoogleAPI(transcript) {
    // Send the transcript to Google API for processing
    // Implement this part based on Google's Speech Recognition API documentation
    // Here's a basic example:
    fetch(`https://your-google-api-endpoint.com`, {
      method: "POST",
      body: JSON.stringify({ transcript: transcript }),
      headers: {
        "Content-Type": "application/json",
        // Add any necessary authentication headers here
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Process the response from Google API
        // For example, you can speak the response to the user
        respond(data.response);
      })
      .catch((error) => {
        console.error("Error processing question:", error);
        respond("I'm sorry, I couldn't understand your question.");
      });
  }

  function pauseAnimation() {
    waves.forEach(function (wave) {
      wave.style.animationPlayState = "paused";
    });
  }

  function resumeAnimation() {
    waves.forEach(function (wave) {
      wave.style.animationPlayState = "running";
    });
  }

  function resetReloadTimer() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(function () {
      location.reload();
    }, 10000);
  }

  recognition.start();
  resetReloadTimer();

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.onaudioprocess = function () {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        const values = [];
        let average = 0;

        for (let i = 0; i < array.length; i++) {
          values.push(array[i]);
          average += array[i];
        }

        average = average / values.length;

        const heightFactor = 3;
        waves.forEach(function (wave) {
          wave.style.height = `${Math.max(10, average * heightFactor)}px`;
        });

        if (speaking) {
          pauseAnimation();
        } else {
          resumeAnimation();
        }
      };
    })
    .catch(function (err) {
      console.error("Error accessing audio stream:", err);
    });
});
