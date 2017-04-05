'use strict';


const PomodoroClock = (function() {

  let setting = {
    audio: null,
    canvas: {
      ctx: null,
      height: 0,
      width: 0,
    },
    color: {
      button: {
        pause: '#7F6A40',
        start: '#407F6A',
        stop: '#C1272D',
      },
      hand: {
        minutes: '#333',
        seconds: '#C1272D',
      },
      tick: '#333',
      none: {
        base: '#7FD4FF', // Light Sky Blue
        light: '#DFF4FE', // Alice Blue
        dark: '#406A7F', // Bismark
      },
      break: {
        base: '#7FFFD4', // Aquamarine
        light: '#DFFEF4', // Clear Day
        dark: '#407F6A', // Viridian
      },
      work: {
        base: '#FF6347', // Tomato
        light: '#FED8D1', // Cosmos
        dark: '#5F251B', // Caput Mortuum
      },
      paused: {
        base: '#FFD47F', // Salomie
        light: '#FEF4DF', // Early Dawn
        dark: '#7F6A40', // Yellow Metal
      },
      contrast: {
        base: '#FFD47F', // Salomie
        light: '#FEF4DF', // Early Dawn
        dark: '#7F6A40', // Yellow Metal
      },
    },
    default: {
      breakTime: 300,
      breakTimeAngle: 0.52359877559829887307710723054658,
      workTime: 1500,
      workTimeAngle: 2.6179938779914943653855361527329,
    },
    size: {
      outerRadius: 150,
      outerRingThickness: 20,
      innerRingThickness: 10,
      tickSize: 10,
    },
    soundIsOn: true,
  };
  let session = {
    breakTime: 0,
    breakTimeAngle: 0,
    current: 'none',
    displayTimerId: 0,
    logicTimerId: 0,
    paused: false,
    pausedTimerId: 0,
    pausedForSeconds: 0,
    pausedForAngle: 0,
    secondsLeft: 0,
    secondsPassed: 0,
    startedAtAngle: 0,
    ticks: 0,
    workTime: 0,
    workTimeAngle: 0,
  };
  let time = {
    hour: 0,
    minute: 0,
    second: 0,
    angle: {
      hour: 0,
      minute: 0,
      second: 0,
    },
  };

  const node = {
    body: null,
    canvas: null,
    feedback: null,
    feedbackAria: null,
    slider: {
      breakTimeSlider: {
        label: null,
        node: null,
      },
      workTimeSlider: {
        label: null,
        node: null,
      },
    },
  };

  /**
   * @function getSetting
   * @description returns the setting object
   * @returns {!Object} setting
   */
  function getSetting() {
    return setting;
  }

  /**
   * @function setSetting
   * @description Replaces the current setting object with the one provided
   * @param {!Object} newSetting
   * @returns {!Object} setting
   */
  function setSetting(newSetting) {
    setting = newSetting;
    return setting;
  }

  /**
   * @function getSession
   * @description returns the session object
   * @returns {!Object} session
   */
  function getSession() {
    return session;
  }

  /**
   * @function setSession
   * @description Replaces the current session object with the one provided
   * @param {!Object} newSession
   * @returns {!Object} session
   */
  function setSession(newSession) {
    session = newSession;
    return session;
  }

  /**
   * @function getTime
   * @description returns the time object
   * @returns {!Object} time
   */
  function getTime() {
    return time;
  }

  /**
   * @function setTime
   * @description Peplaces the current time object with the one provided
   * @param {!Object} newTime
   * @returns {!Object} time
   */
  function setTime(newTime) {
    time = newTime;
    return time;
  }

  /**
   * @function degToRad
   * @description Helper function for translating degrees to radians
   * @param degrees
   * @returns {!number}
   */
  function degToRad(degrees) {
    return (Math.PI / 180) * degrees;
  }

  /**
   * @function drawCanvas
   * @description Draws the canvas
   * @param {!Object} settingsDep - The settings object dependency
   * @param {!Object} sessionDep - The session object dependency
   * @param {!Object} timeDep - The time object dependency
   */
  function drawCanvas(settingsDep, sessionDep, timeDep) {
    if (settingsDep.canvas.ctx) {
      const ctx = settingsDep.canvas.ctx;
      const outerRadius = settingsDep.size.outerRadius;
      const outerRingThickness = settingsDep.size.outerRingThickness;
      const innerRadius = settingsDep.size.outerRadius - settingsDep.size.outerRingThickness;
      const innerRingThickness = settingsDep.size.innerRingThickness;
      const tickSize = settingsDep.size.tickSize;

      ctx.clearRect(0, 0, settingsDep.canvas.width, settingsDep.canvas.height);

      ctx.save();

      // Move the origin to the center point.
      ctx.translate(settingsDep.canvas.width / 2, settingsDep.canvas.height - (settingsDep.canvas.width / 2));

      // Rotate so 0 degrees is at the top
      ctx.rotate(-0.5 * Math.PI);

      // Outer ring
      ctx.beginPath();
      ctx.lineWidth = outerRingThickness;

      if (sessionDep.paused) {
        ctx.strokeStyle = settingsDep.color.paused.base;
      } else {
        ctx.strokeStyle = settingsDep.color[sessionDep.current].base;
      }

      // if (sessionDep.current === 'work') {
      //   ctx.fillStyle = settingsDep.color.break.light;
      // } else {
      //   ctx.fillStyle = settingsDep.color[sessionDep.current].light;
      // }
      ctx.fillStyle = '#fff';

      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Start button
      ctx.beginPath();
      ctx.moveTo(outerRadius, 0);
      ctx.lineTo(outerRadius + 30, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = outerRingThickness;

      if (sessionDep.current === 'none') {
        ctx.fillStyle = settingsDep.color[sessionDep.current].dark;
      } else if (sessionDep.paused) {
        ctx.fillStyle = settingsDep.color[sessionDep.current].dark;
      } else {
        ctx.fillStyle = settingsDep.color.paused.dark;
      }

      ctx.fillRect(outerRadius + 23, -15, 15, 30);

      // Start button
      ctx.save();
      ctx.rotate(degToRad(30));
      ctx.beginPath();
      ctx.moveTo(outerRadius, 0);
      ctx.lineTo(outerRadius + 23, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = outerRingThickness;
      ctx.fillStyle = settingsDep.color.button.stop;
      ctx.fillRect(outerRadius + 23, -15, 10, 30);
      ctx.restore();

      // Visualize current period
      if (sessionDep.current !== 'none') {
        ctx.save();

        // Start at current time angle + time left angle
        ctx.rotate(sessionDep.startedAtAngle + sessionDep.pausedForAngle);

        if (sessionDep.current === 'work') {
          // Show work period
          ctx.beginPath();
          ctx.fillStyle = settingsDep.color.work.light;
          ctx.arc(0, 0, innerRadius, 0, sessionDep.workTimeAngle);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
        } else if (sessionDep.current === 'break') {
          // Show break period
          ctx.beginPath();
          ctx.fillStyle = settingsDep.color.break.light;
          ctx.arc(0, 0, innerRadius, 0, sessionDep.breakTimeAngle);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // Visualize upcoming period
      if (sessionDep.current !== 'none') {
        ctx.save();

        // Start at current time angle + time left angle
        ctx.rotate(sessionDep.startedAtAngle + sessionDep.pausedForAngle);

        if (sessionDep.current === 'work') {
          // Show upcoming break period
          ctx.beginPath();
          ctx.fillStyle = settingsDep.color.break.light;
          ctx.arc(0, 0, innerRadius, sessionDep.workTimeAngle, sessionDep.workTimeAngle + sessionDep.breakTimeAngle);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
        } else if (sessionDep.current === 'break') {
          // Show upcoming work period
          ctx.beginPath();
          ctx.fillStyle = settingsDep.color.work.light;
          ctx.arc(0, 0, innerRadius, sessionDep.breakTimeAngle, sessionDep.breakTimeAngle + sessionDep.workTimeAngle);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // Inner ring
      ctx.beginPath();
      ctx.lineWidth = innerRingThickness;

      if (sessionDep.paused) {
        ctx.strokeStyle = settingsDep.color.paused.dark;
      } else {
        ctx.strokeStyle = settingsDep.color[sessionDep.current].dark;
      }

      ctx.arc(0, 0, innerRadius + (innerRingThickness / 2), 0, Math.PI * 2);
      ctx.stroke();

      // render ticks
      ctx.lineCap = 'butt';
      ctx.lineWidth = 1;
      ctx.strokeStyle = settingsDep.color.tick;
      ctx.beginPath();

      for (let numTicks = 0; numTicks < 60; numTicks++) {
        ctx.rotate((2 * Math.PI) / 60);
        ctx.moveTo(innerRadius - tickSize, 0);
        ctx.lineTo(innerRadius, 0);
      }

      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;

      for (let numTicks = 0; numTicks < 12; numTicks++) {
        ctx.rotate((2 * Math.PI) / 12);
        ctx.moveTo(innerRadius - tickSize, 0);
        ctx.lineTo(innerRadius, 0);
      }

      ctx.stroke();

      ctx.beginPath();

      // Hour hand
      ctx.save();
      ctx.rotate(timeDep.angle.hour);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(innerRadius / 2, 0);
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // Minutes hand
      ctx.save();
      ctx.rotate(timeDep.angle.minute);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(innerRadius - tickSize, 0);
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // Seconds hand
      ctx.save();
      ctx.beginPath();
      ctx.rotate(timeDep.angle.second);
      ctx.moveTo(0, 0);
      ctx.lineTo(innerRadius, 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = settingsDep.color.hand.seconds;
      ctx.stroke();

      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, 2 * Math.PI);
      ctx.fillStyle = settingsDep.color.hand.seconds;
      ctx.fill();

      // Mount point
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, 2 * Math.PI);
      ctx.fillStyle = settingsDep.color.tick;
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * @callback updateDisplay
   * @description Update the display with the new time
   */
  function updateDisplay() {
    const setting = getSetting();
    const session = getSession();
    let time = getTime();

    const date = new Date();
    time.hour = date.getHours();
    time.minute = date.getMinutes();
    time.second = date.getSeconds();
    time.angle.hour = ((time.hour * Math.PI) / 6) + ((time.minute * Math.PI) / (6 * 60)) + ((time.second * Math.PI) / (360 * 60));
    time.angle.minute = ((time.minute * Math.PI) / 30) + ((time.second * Math.PI) / (30 * 60));
    time.angle.second = ((time.second * Math.PI) / 30);
    time = setTime(time);

    drawCanvas(setting, session, time);
  }

  /**
   * @callback logic
   * @description Calculates the work and break time.
   * @returns {!Object} session
   */
  function logic() {
    const setting = getSetting();
    const session = getSession();

    if (!session.paused && session.current !== 'none') {
      session.secondsPassed++;
      session.secondsLeft--;

      if (session.secondsLeft <= 0) {
        session.startedAtAngle = ((time.minute * Math.PI) / 30) + ((time.second * Math.PI) / (30 * 60));
        if (session.current === 'work') {
          session.current = 'break';
          session.secondsLeft = session.breakTime;
          node.feedback.innerHTML = 'Take a Break!';
        } else if (session.current === 'break') {
          session.current = 'work';
          session.secondsLeft = session.workTime;
          node.feedback.innerHTML = 'Now focus you';
        }
      }

      if (session.secondsLeft === 1) {
        if (setting.soundIsOn) {
          setting.audio.play();
        }
      } else if (session.secondsLeft <= 5) {
        node.feedback.innerHTML = 'Almost...';
        node.feedbackAria.innerHTML = `${session.secondsLeft} seconds to go`;
      } else {
        node.feedbackAria.innerHTML = `${Math.floor(session.secondsLeft / 60)} minutes to go`;
      }

      if (session.current === 'break') {
        node.body.classList.remove('c-body--work');
        node.body.classList.add('c-body--break');
      } else if (session.current === 'work') {
        node.body.classList.remove('c-body--break');
        node.body.classList.add('c-body--work');
      }
    }

    if (session.current === 'none') {
      node.body.classList.remove('c-body--work');
      node.body.classList.remove('c-body--break');
    }

    return setSession(session);
  }

  /**
   * @callback Pause
   * @description Callback for the paused timer
   * @param {!Object} sessionDep - The session object dependency
   * @returns {!Object} session
   */
  function pause(sessionDep) {
    sessionDep.pausedForSeconds++;
    sessionDep.pausedForAngle = degToRad((sessionDep.pausedForSeconds / 3600) * 360);
    return setSession(sessionDep);
  }

  /**
   * @function startPom
   * @description Start a new pomorodo session or pause one that is started
   * @param {!Object} sessionDep - The session object dependency
   * @param {!Object} timeDep - The time object dependency
   * @returns {!Object} session
   */
  function startPom(sessionDep, timeDep) {
    if (sessionDep.current === 'none') {
      sessionDep.secondsLeft = sessionDep.workTime;
      sessionDep.secondsPassed = 0;
      sessionDep.current = 'work';
      sessionDep.paused = false;
      sessionDep.startedAtAngle = ((timeDep.minute * Math.PI) / 30) + ((timeDep.second * Math.PI) / (30 * 60));
      sessionDep.pausedForSeconds = 0;

      clearInterval(sessionDep.pausedTimerId);

      console.info('pom started');
      node.feedback.innerHTML = 'In session';
    } else {
      sessionDep.paused = !sessionDep.paused;

      if (sessionDep.paused) {

        console.info('pom paused');
        node.feedback.innerHTML = 'Session is paused';

        sessionDep.pausedTimerId = setInterval(pause, 1000, sessionDep);
      } else {
        clearInterval(sessionDep.pausedTimerId);
      }
    }

    return setSession(sessionDep);
  }

  /**
   * @function stopPom
   * @description Stop the current pomodoro session
   * @param {!Object} sessionDep
   * @returns {!Object} session
   */
  function stopPom(sessionDep) {
    clearInterval(sessionDep.pausedTimerId);

    sessionDep.secondsPassed = 0;
    sessionDep.secondsLeft = 0;
    sessionDep.current = 'none';
    sessionDep.paused = false;
    sessionDep.pausedForSeconds = 0;
    sessionDep.startedAtAngle = 0;

    console.info('pom stopped');
    node.feedback.innerHTML = 'Session stopped';

    return setSession(sessionDep);
  }

  /**
   * @callback Callback for slider changes
   * @param ev
   */
  function handleSlider(ev) {
    let session = getSession();

    const currentWorkTime = session.workTime; // Save current work time
    const currentBreakTime = session.breakTime; // Save current break time
    const newValue = +ev.target.value;

    if (ev.target && ev.target.id) {
      switch (ev.target.id) {
        /* eslint-disable indent */
        case 'js-pom-work':
          session.workTime = newValue * 60;
          session.workTimeAngle = degToRad(((newValue / 60) * 360));
          node.slider.workTimeSlider.label.innerHTML = `[${newValue} min.]`;
          if (session.current === 'work') {
            if (session.workTime > currentWorkTime) {
              session.secondsLeft = (session.workTime - session.secondsPassed);
            } else if (session.workTime < currentWorkTime) {
              if (session.workTime - session.secondsPassed > 0) {
                session.secondsLeft = (session.workTime - session.secondsPassed);
              } else {
                session.secondsLeft = 0;
              }
            }
          }
          break;
        case 'js-pom-break':
          session.breakTime = newValue * 60;
          session.breakTimeAngle = degToRad(((newValue / 60) * 360));
          node.slider.breakTimeSlider.label.innerHTML = `[${newValue} min.]`;
          if (session.current === 'break') {
            if (session.breakTime > currentBreakTime) {
              session.secondsLeft = (session.breakTime - session.secondsPassed);
            } else if (session.breakTime < currentBreakTime) {
              if (session.breakTime - session.secondsPassed > 0) {
                session.secondsLeft = (session.breakTime - session.secondsPassed);
              } else {
                session.secondsLeft = 0;
              }
            }
          }
          break;
        default:
          break;
        /* eslint-enable indent */
      }
    }

    setSession(session);
  }

  /**
   * @callback Callback for up and down button clicks
   * @param ev
   */
  function handleUpDownButtons(ev) {
    let session = getSession();

    const workSlider = node.slider.workTimeSlider.node;
    const breakSlider = node.slider.breakTimeSlider.node;

    let workSliderValue = +workSlider.value;
    let breakSliderValue = +breakSlider.value;

    if (ev.target && ev.target.id) {
      switch (ev.target.id) {
        /* eslint-disable indent */
        case 'js-pom-work-down':
          if (workSliderValue > 1) {
            workSliderValue--;
            session.workTime = workSliderValue * 60;
            session.workTimeAngle = degToRad(((workSliderValue / 60) * 360));
            node.slider.workTimeSlider.label.innerHTML = `[${workSliderValue} min.]`;
            workSlider.value = workSliderValue;

            if (session.secondsLeft > 0) {
              session.secondsLeft -= 60;
            }
          }
          break;
        case 'js-pom-work-up':
          if (workSliderValue < 60) {
            workSliderValue++;
            session.workTime = workSliderValue * 60;
            session.workTimeAngle = degToRad(((workSliderValue / 60) * 360));
            node.slider.workTimeSlider.label.innerHTML = `[${workSliderValue} min.]`;
            workSlider.value = workSliderValue;

            session.secondsLeft += 60;
          }
          break;
        case 'js-pom-break-down':
          if (breakSliderValue > 1) {
            breakSliderValue--;
            session.breakTime = breakSliderValue * 60;
            session.breakTimeAngle = degToRad(((breakSliderValue / 60) * 360));
            node.slider.breakTimeSlider.label.innerHTML = `[${breakSliderValue} min.]`;
            breakSlider.value = breakSliderValue;

            if (session.secondsLeft > 0) {
              session.secondsLeft -= 60;
            }
          }
          break;
        case 'js-pom-break-up':
          if (breakSliderValue < 20) {
            breakSliderValue++;
            session.breakTime = breakSliderValue * 60;
            session.breakTimeAngle = degToRad(((breakSliderValue / 60) * 360));
            node.slider.breakTimeSlider.label.innerHTML = `[${breakSliderValue} min.]`;
            breakSlider.value = breakSliderValue;

            session.secondsLeft += 60;
          }
          break;
        default:
          break;
        /* eslint-enable indent */
      }
    }

    setSession(session);
  }

  function PomodoroClock() {
    const time = getTime();

    let setting = getSetting();
    let session = getSession();

    // Body
    node.body = document.getElementById('js-body');

    // Canvas
    node.canvas = document.getElementById('js-pom-canvas');

    // Audio
    setting.audio = document.getElementById('js-pom-sound');

    // Adjustment sliders
    node.slider.workTimeSlider.node = document.getElementById('js-pom-work');
    node.slider.breakTimeSlider.node = document.getElementById('js-pom-break');
    node.slider.workTimeSlider.label = document.getElementById('js-pom-workperiod');
    node.slider.breakTimeSlider.label = document.getElementById('js-pom-breakperiod');

    // Feddback display
    node.feedback = document.getElementById('js-pom-feedback');
    node.feedbackAria = document.getElementById('js-pom-feedback-aria');

    if (!session.breakTime) {
      session.breakTime = setting.default.breakTime;
      session.breakTimeAngle = setting.default.breakTimeAngle;
      node.slider.breakTimeSlider.node.value = session.breakTime / 60;
      node.slider.breakTimeSlider.label.innerHTML = `[${node.slider.breakTimeSlider.node.value} min.]`;
    }

    if (!session.workTime) {
      session.workTime = setting.default.workTime;
      session.workTimeAngle = setting.default.workTimeAngle;
      node.slider.workTimeSlider.node.value = session.workTime / 60;
      node.slider.workTimeSlider.label.innerHTML = `[${node.slider.workTimeSlider.node.value} min.]`;
    }

    node.slider.workTimeSlider.node.addEventListener('change', handleSlider, true);
    node.slider.breakTimeSlider.node.addEventListener('change', handleSlider, true);

    if (node.canvas.getContext) {
      setting.canvas.ctx = node.canvas.getContext('2d');
      setting.canvas.height = node.canvas.height;
      setting.canvas.width = node.canvas.width;

      setting = setSetting(setting);

      drawCanvas(setting, session, time);

      clearInterval(session.displayTimerId);
      clearInterval(session.logicTimerId);

      session.displayTimerId = setInterval(updateDisplay, 500);
      session.logicTimerId = setInterval(logic, 1000);
    }

    setSession(session);
  }

  /**
   * @event Listen for click events
   */
  window.addEventListener('click', (ev) => {
    if (ev.target) {
      if (ev.target.id) {
        const session = getSession();
        const time = getTime();

        switch (ev.target.id) {
          /* eslint-disable indent */
          case 'js-pom-start':
            startPom(session, time);
            break;
          case 'js-pom-stop':
            stopPom(session);
            break;
          case 'js-pom-work-down':
          case 'js-pom-work-up':
          case 'js-pom-break-down':
          case 'js-pom-break-up':
            handleUpDownButtons(ev);
            break;
          default:
            break;
          /* eslint-enable indent */
        }
      }
    }
  }, true);

  return PomodoroClock;
})();

window.addEventListener('load', () => {
  const pom = new PomodoroClock();
});
