import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const input = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');

const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');
const secondsEl = document.querySelector('[data-seconds]');

startBtn.disabled = true;

let userSelectedDate = null;
let timerId = null;
let fp = null;

function initFlatpickr() {
  fp = flatpickr(input, {
    enableTime: true,
    time_24hr: true,
    defaultDate: new Date(),
    minuteIncrement: 1,
    dateFormat: 'Y-m-d H:i',
    allowInput: false,
    onClose(selectedDates) {
      const selectedDate = selectedDates[0];
      const now = new Date();

      if (selectedDate <= now) {
        startBtn.disabled = true;
        iziToast.error({
          title: 'Error',
          message: 'Please choose a date in the future',
          position: 'topRight',
        });
        return;
      }

      userSelectedDate = selectedDate;
      startBtn.disabled = false;
    },
  });
}

initFlatpickr();

startBtn.addEventListener('click', () => {
  if (!userSelectedDate || timerId) return;

  if (fp) {
    fp.destroy();
    fp = null;
  }

  input.disabled = true;
  startBtn.disabled = true;

  updateOnce();

  timerId = setInterval(() => {
    updateOnce();
  }, 1000);
});

function updateOnce() {
  const now = new Date();
  const diff = userSelectedDate - now;

  if (diff <= 0) {
    clearInterval(timerId);
    timerId = null;
    updateTimerDisplay(0, 0, 0, 0);

    input.disabled = false;
    userSelectedDate = null;

    initFlatpickr();
    startBtn.disabled = true;

    return;
  }

  const { days, hours, minutes, seconds } = convertMs(diff);
  updateTimerDisplay(days, hours, minutes, seconds);
}

function updateTimerDisplay(days, hours, minutes, seconds) {
  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}
