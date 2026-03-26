// ===== AudioManager =====
// Pure Web Audio API synthesized sounds — zero external files.
// 8-bit / Lo-fi style matching the IDE theme.

import { loadAudioPrefs, saveAudioPrefs } from './save.js';

export class AudioManager {
    #ctx = null;
    #sfxGain = null;
    #bgmGain = null;
    #masterGain = null;
    #prefs = null;
    #bgmRunning = false;

    constructor() {
        this.#prefs = loadAudioPrefs();
    }

    /** Initialize AudioContext. Must be called after a user gesture. */
    init() {
        if (this.#ctx) return;
        try {
            this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.#masterGain = this.#ctx.createGain();
            this.#masterGain.connect(this.#ctx.destination);
            this.#sfxGain = this.#ctx.createGain();
            this.#sfxGain.connect(this.#masterGain);
            this.#bgmGain = this.#ctx.createGain();
            this.#bgmGain.connect(this.#masterGain);
            this.#applyPrefs();
        } catch (e) {
            console.warn('Web Audio API not available:', e);
        }
    }

    // ===== Sound Effects =====

    play(soundId) {
        if (!this.#ctx || this.#prefs.muted) return;
        if (this.#ctx.state === 'suspended') this.#ctx.resume();

        switch (soundId) {
            case 'click':       this.#playClick(); break;
            case 'good':        this.#playGood(); break;
            case 'bad':         this.#playBad(); break;
            case 'special':     this.#playSpecial(); break;
            case 'choice':      this.#playChoice(); break;
            case 'achievement': this.#playAchievement(); break;
            case 'month_end':   this.#playMonthEnd(); break;
            case 'win':         this.#playWin(); break;
            case 'lose':        this.#playLose(); break;
            default: break;
        }
    }

    #playClick() {
        const t = this.#ctx.currentTime;
        const osc = this.#ctx.createOscillator();
        const gain = this.#ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain).connect(this.#sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    #playGood() {
        const t = this.#ctx.currentTime;
        [523, 659, 784].forEach((freq, i) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * 0.08);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
            osc.connect(gain).connect(this.#sfxGain);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.25);
        });
    }

    #playBad() {
        const t = this.#ctx.currentTime;
        [392, 330, 262].forEach((freq, i) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t + i * 0.1);
            gain.gain.setValueAtTime(0.12, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
            osc.connect(gain).connect(this.#sfxGain);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.25);
        });
    }

    #playSpecial() {
        const t = this.#ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain).connect(this.#sfxGain);
            osc.start(t);
            osc.stop(t + 0.5);
        });
    }

    #playChoice() {
        const t = this.#ctx.currentTime;
        [660, 880].forEach((freq, i) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.12);
            gain.gain.setValueAtTime(0.2, t + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.15);
            osc.connect(gain).connect(this.#sfxGain);
            osc.start(t + i * 0.12);
            osc.stop(t + i * 0.12 + 0.2);
        });
    }

    #playAchievement() {
        const t = this.#ctx.currentTime;
        [523, 659, 784, 1047, 1319].forEach((freq, i) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * 0.06);
            gain.gain.setValueAtTime(0.15, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.3);
            osc.connect(gain).connect(this.#sfxGain);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.35);
        });
    }

    #playMonthEnd() {
        const t = this.#ctx.currentTime;
        const osc = this.#ctx.createOscillator();
        const gain = this.#ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain).connect(this.#sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);
    }

    #playWin() {
        const t = this.#ctx.currentTime;
        [
            { notes: [523, 659, 784], time: 0 },
            { notes: [587, 740, 880], time: 0.25 },
            { notes: [659, 784, 1047], time: 0.5 }
        ].forEach(({ notes, time }) => {
            notes.forEach(freq => {
                const osc = this.#ctx.createOscillator();
                const gain = this.#ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + time);
                gain.gain.setValueAtTime(0.12, t + time);
                gain.gain.exponentialRampToValueAtTime(0.001, t + time + 0.6);
                osc.connect(gain).connect(this.#sfxGain);
                osc.start(t + time);
                osc.stop(t + time + 0.65);
            });
        });
    }

    #playLose() {
        const t = this.#ctx.currentTime;
        [330, 277, 220, 165].forEach((freq, i) => {
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t + i * 0.2);
            gain.gain.setValueAtTime(0.1, t + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.4);
            osc.connect(gain).connect(this.#sfxGain);
            osc.start(t + i * 0.2);
            osc.stop(t + i * 0.2 + 0.45);
        });
    }

    // ===== BGM =====

    startBGM() {
        if (!this.#ctx || this.#bgmRunning) return;
        this.#bgmRunning = true;
        this.#loopBGM();
    }

    stopBGM() {
        this.#bgmRunning = false;
    }

    #loopBGM() {
        if (!this.#bgmRunning || !this.#ctx) return;
        const t = this.#ctx.currentTime;
        const scale = [262, 294, 330, 392, 440];
        const noteCount = 8;
        const noteDuration = 0.4;
        for (let i = 0; i < noteCount; i++) {
            const freq = scale[Math.floor(Math.random() * scale.length)];
            const osc = this.#ctx.createOscillator();
            const gain = this.#ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * noteDuration);
            gain.gain.setValueAtTime(0, t + i * noteDuration);
            gain.gain.linearRampToValueAtTime(0.06, t + i * noteDuration + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * noteDuration + noteDuration * 0.9);
            osc.connect(gain).connect(this.#bgmGain);
            osc.start(t + i * noteDuration);
            osc.stop(t + i * noteDuration + noteDuration);
        }
        setTimeout(() => this.#loopBGM(), noteCount * noteDuration * 1000);
    }

    // ===== Volume Controls =====

    setSfxVolume(val) {
        this.#prefs.sfxVol = Math.max(0, Math.min(1, val));
        if (this.#sfxGain) this.#sfxGain.gain.value = this.#prefs.sfxVol;
        saveAudioPrefs(this.#prefs);
    }

    setBgmVolume(val) {
        this.#prefs.bgmVol = Math.max(0, Math.min(1, val));
        if (this.#bgmGain) this.#bgmGain.gain.value = this.#prefs.bgmVol;
        saveAudioPrefs(this.#prefs);
    }

    toggleMute() {
        this.#prefs.muted = !this.#prefs.muted;
        this.#applyPrefs();
        saveAudioPrefs(this.#prefs);
        return this.#prefs.muted;
    }

    isMuted() {
        return this.#prefs.muted;
    }

    getPrefs() {
        return { ...this.#prefs };
    }

    #applyPrefs() {
        if (!this.#masterGain) return;
        this.#masterGain.gain.value = this.#prefs.muted ? 0 : 1;
        if (this.#sfxGain) this.#sfxGain.gain.value = this.#prefs.sfxVol;
        if (this.#bgmGain) this.#bgmGain.gain.value = this.#prefs.bgmVol;
    }
}
