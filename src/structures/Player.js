"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }
  return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to set private field on non-instance");
  }
  privateMap.set(receiver, value);
  return value;
};
var _filters;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const events_1 = require("events");
const Structures_1 = require("../Structures");
class Player extends events_1.EventEmitter {
  constructor(socket, guild) {
    super();
    _filters.set(this, void 0);
    this.socket = socket;
    this.guild = guild;
    this.state = { volume: 100, equalizer: [], timescale: {}, tremolo: {}, vibrato: {}, karaoke: {}, distortion: {}, rotation: {}, channelMix: {}, lowPass: {} };
    this.paused = false;
    this.playing = false;
    this.position = 0;
    this.connected = false;
    this.on("playerUpdate", this._playerUpdate.bind(this));
    this.on("event", this._event.bind(this));
  }
  get filters() {
    if (!__classPrivateFieldGet(this, _filters)) {
      __classPrivateFieldSet(this, _filters, new (Structures_1.Structures.get("filters"))(this));
    }
    return __classPrivateFieldGet(this, _filters);
  }
  get manager() {
    return this.socket.manager;
  }
  connect(channel, options = {}) {
    const channelId = typeof channel === "object"
      ? channel?.id
      : channel;
    this.channel = channelId;
    this.socket.manager.send(this.guild, {
      op: 4,
      d: {
        guild_id: this.guild,
        channel_id: channelId ?? null,
        self_deaf: options.selfDeaf ?? false,
        self_mute: options.selfMute ?? false,
      },
    });
    return this;
  }
  disconnect() {
    return this.connect(null);
  }
  async move(socket) {
    this.socket = socket;
    await this.destroy();
    if (this.channel) {
      this.connect(this.channel);
    }
    return this;
  }
  play(track, options = {}) {
    track = typeof track === "string" ? track : track.track;
    return this.send("play", Object.assign({ track }, options));
  }
  setVolume(volume = 100) {
    if (volume < 0 || volume > 1000) {
      throw new RangeError(`Player#setVolume (${this.guild}): Volume must be within the 0 to 1000 range.`);
    }
    this.state.volume = volume;
    return this.send("volume", { volume });
  }
  pause(state = true) {
    this.paused = state;
    this.playing = !state;
    return this.send("pause", { pause: state });
  }
  resume() {
    return this.pause(false);
  }
  stop() {
    delete this.track;
    delete this.timestamp;
    this.position = 0;
    return this.send("stop");
  }
  seek(position) {
    if (!this.track) {
      throw new Error(`Player#seek() ${this.guild}: Not playing anything.`);
    }
    return this.send("seek", { position });
  }
  async equalizer(bands) {

    const d = await this.send("filters", { equalizer: bands });
    this.state.equalizer = bands;
    return d;
  }

  async timescale(settings) {
    for (let key in settings) {
      if (typeof settings[key] !== 'number')
        throw new RangeError(`Provided argument '${key}' must be a number`);
      if (settings[key] < 0)
        throw new RangeError(`Provided argument '${key}' cannot be smaller than 0.0.`);
    }

    const d = await this.send("filters", { timescale: settings });
    this.state.timescale = settings;
    return d;
  }

  async vibrato(settings) {
    for (let key in settings) {
      if (typeof settings[key] !== 'number')
        throw new RangeError(`Provided argument '${key}' must be a number.`)
    }

    if (settings.frequency < 0 || settings.frequency > 14)
      throw new RangeError('Frequency argument cannot be smaller than 0.0.');

    if (settings.depth < 0 || settings.depth > 1)
      throw new RangeError('Depth argument cannot be smaller than 0.0 or higher than 1.0.');

    const d = await this.send("filters", { vibrato: settings });
    this.state.vibrato = settings;
    return d;
  }

  async tremolo(settings) {
    for (let key in settings) {
      if (typeof settings[key] !== 'number')
        throw new RangeError(`Provided argument '${key}' must be a number.`)
    }

    if (settings.frequency < 0)
      throw new RangeError('Frequency argument cannot be smaller than 0.0.');
    if (settings.depth < 0 || settings.depth > 1)
      throw new RangeError('Depth argument cannot be smaller than 0.0 or bigger than 1.0.');

    const d = await this.send("filters", { tremolo: settings });
    this.state.tremolo = settings;
    return d;
  }

  async karaoke(settings) {
    for (let key in settings) {
      if (typeof settings[key] !== 'number')
        throw new RangeError(`Provided argument '${key}' must be a number.`)
    }

    const d = await this.send("filters", { karaoke: settings });
    this.state.karaoke = settings;
    return d;
  }

  async distortion(settings) {
    const d = await this.send("filters", { distortion: settings });
    this.state.distortion = settings;
    return d;
  }

  async rotation(settings) {
    const d = await this.send("filters", { rotation: settings });
    this.state.rotation = settings;
    return d;
  }

  async channelMix(settings) {
    const d = await this.send("filters", { channelMix: settings });
    this.state.channelMix = settings;
    return d;
  }

  async lowPass(settings) {
    const d = await this.send("filters", { lowPass: settings });
    this.state.lowPass = settings;
    return d;
  }

  async filter(settings) {
    const d = await this.send("filters", settings);
    this.state = { volume: this.state.volume, ...settings }
    return d;
  }

  destroy(disconnect = false) {
    if (disconnect) {
      this.disconnect();
    }
    return this.send("destroy");
  }
  async handleVoiceUpdate(update) {
    "token" in update
      ? this._server = update
      : this._sessionId = update.session_id;
    if (this._sessionId && this._server) {
      await this.send("voiceUpdate", {
        sessionId: this._sessionId,
        event: this._server,
      });
      this.connected = true;
    }
    return this;
  }
  send(op, data = {}, priority = false) {
    data.guildId ?? (data.guildId = this.guild);
    this.socket.send({ op, ...data }, priority);
    return this;
  }
  async _event(event) {
    switch (event.type) {
      case "TrackEndEvent":
        if (event.reason !== "REPLACED") {
          this.playing = false;
        }
        this.timestamp = this.track = undefined;
        this.emit("end", event);
        break;
      case "TrackExceptionEvent":
        this.emit("error", event);
        break;
      case "TrackStartEvent":
        this.playing = true;
        this.track = event.track;
        this.emit("start", event);
        break;
      case "TrackStuckEvent":
        await this.stop();
        this.emit("stuck", event);
        break;
      case "WebSocketClosedEvent":
        this.emit("closed", event);
        break;
    }
  }
  _playerUpdate(update) {
    if (!update.state) {
      return;
    }
    this.position = update.state.position;
    this.timestamp = update.state.time;
    this.state = { volume: this.volume, equalizer: this.state.equalizer, ...this.state };
  }
}
exports.Player = Player;
_filters = new WeakMap();
