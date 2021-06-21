"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
class Filters {
  constructor(player) {
    this.player = player;
    this.volume = 1;
    this.equalizer = [];
    this.tremolo = null;
    this.karaoke = null;
    this.timescale = null
    this.vibrato = null;
    this.distortion = null;
    this.rotation = null;
    this.channelMix = null;
    this.lowPass = null;
  }
  get isEqualizerEnabled() {
    return this.equalizer.some(band => band.gain !== 0.0);
  }
  get isTremoloEnabled() {
    return !!this.tremolo && this.tremolo.depth !== 0.0;
  }
  get isKaraokeEnabled() {
    return !!this.karaoke;
  }
  get isDistortionEnabled() {
    return !!this.distortion;
  }
  get isTimescaleEnabled() {
    return !!this.timescale && Object.values(this.timescale).some(v => v !== 1.0);
  }
  get isVibratoEnabled() {
    return !!this.vibrato;
  }
  get isRotationEnabled() {
    return !!this.rotation;
  }
  get isChannelMixEnabled() {
    return !!this.channelMix;
  }
  get islowPassEnabled() {
    return !!this.lowPass;
  }
  get payload() {
    const payload = {
      volume: this.volume,
      equalizer: this.equalizer
    };
    if (this.isTimescaleEnabled) {
      payload.timescale = this.timescale;
    }
    if (this.isKaraokeEnabled) {
      payload.karaoke = this.karaoke;
    }
    if (this.isTremoloEnabled) {
      payload.tremolo = this.tremolo;
    }
    return payload;
  }
  apply(prioritize = false) {
    this.player.send("filters", this.payload, prioritize);
    return this;
  }
}
exports.Filters = Filters;
Filters.DEFAULT_VOLUME = 1;
Filters.DEFAULT_TIMESCALE = {
  rate: 1,
  speed: 1,
  pitch: 1
};
Filters.DEFAULT_KARAOKE = {
  level: 1,
  monoLevel: 1,
  filterBand: 220,
  filterWidth: 100
};
Filters.DEFAULT_TREMOLO = {
  depth: .5,
  frequency: 2
};
Filters.DEFAULT_DISTORTION = {
  sinOffset: 0,
  sinScale: 1,
  cosOffset: 0,
  cosScale: 1,
  tanOffset: 0,
  tanScale: 1,
  offset: 0,
  scale: 1
}
Filters.DEFAULT_ROTATION = {
  rotation: {
    rotationHz: 0.2
  }
}
Filters.DEFAULT_CHANNELMIX = {
  leftToLeft: 1.0,
  leftToRight: 0.0,
  rightToLeft: 0.0,
  rightToRight: 1.0
}
Filters.DEFAULT_LOWPASS = {
  smoothing: 20.0
}