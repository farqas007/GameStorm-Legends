import wave
import math
import random
import struct

SAMPLE_RATE = 44100
DURATION = 92.447
TOTAL = int(SAMPLE_RATE * DURATION)

random.seed(7)

audio = [0.0] * TOTAL


def add_tone(start, duration, frequency, volume=0.2,
             waveform="sine", end_frequency=None):

    start_i = int(start * SAMPLE_RATE)
    end_i = min(
        TOTAL,
        int((start + duration) * SAMPLE_RATE)
    )

    count = max(1, end_i - start_i)

    for i in range(count):

        t = i / SAMPLE_RATE

        if end_frequency is not None:
            progress = t / duration
            freq = frequency + (
                end_frequency - frequency
            ) * progress
        else:
            freq = frequency

        phase = 2 * math.pi * freq * t

        if waveform == "sine":
            value = math.sin(phase)

        elif waveform == "square":
            value = 1.0 if math.sin(phase) >= 0 else -1.0

        elif waveform == "saw":
            value = 2 * (
                (freq * t) % 1
            ) - 1

        elif waveform == "triangle":
            value = 2 * abs(
                2 * ((freq * t) % 1) - 1
            ) - 1

        else:
            value = math.sin(phase)

        # Attack / release
        attack = min(0.04, duration * 0.2)
        release = min(0.12, duration * 0.3)

        envelope = 1.0

        if t < attack:
            envelope = t / attack

        if t > duration - release:
            envelope = max(
                0,
                (duration - t) / release
            )

        audio[start_i + i] += (
            value *
            volume *
            envelope
        )


def add_noise(start, duration, volume=0.12):

    start_i = int(start * SAMPLE_RATE)
    end_i = min(
        TOTAL,
        int((start + duration) * SAMPLE_RATE)
    )

    for i in range(start_i, end_i):

        t = (
            i - start_i
        ) / SAMPLE_RATE

        envelope = max(
            0,
            1 - t / duration
        )

        audio[i] += (
            random.uniform(-1, 1)
            * volume
            * envelope
        )


def impact(time, strength=0.7):

    add_tone(
        time,
        0.45,
        90,
        strength,
        "sine",
        38
    )

    add_tone(
        time,
        0.16,
        180,
        strength * 0.35,
        "triangle"
    )

    add_noise(
        time,
        0.22,
        strength * 0.25
    )


def whoosh(time, duration=0.5):

    add_noise(
        time,
        duration,
        0.16
    )

    add_tone(
        time,
        duration,
        180,
        0.12,
        "saw",
        1800
    )


def lightning(time):

    add_noise(
        time,
        0.25,
        0.35
    )

    add_tone(
        time,
        0.32,
        900,
        0.16,
        "saw",
        180
    )


# =========================================
# INTRO — 0 to 5
# =========================================

# Dark ambient
add_tone(
    0,
    5,
    55,
    0.10,
    "sine"
)

# Slow low pulses
for t in [0.0, 1.0, 2.0, 3.0, 4.0]:

    add_tone(
        t,
        0.35,
        55,
        0.22,
        "sine",
        38
    )


# Lightning
lightning(1.2)
lightning(3.0)

# Rising energy
add_tone(
    3.0,
    2.0,
    80,
    0.12,
    "saw",
    500
)

# Intro impact
impact(4.6, 0.65)


# =========================================
# PLZ LIKE — 5 to 7
# =========================================

impact(5.0, 0.9)

add_tone(
    5.1,
    0.5,
    220,
    0.16,
    "square",
    330
)


# =========================================
# SHARE — 7 to 9
# =========================================

whoosh(7.0, 0.55)

impact(7.55, 0.75)

add_tone(
    7.7,
    0.8,
    330,
    0.10,
    "square",
    440
)


# =========================================
# YOUTUBE — 9 to 15
# =========================================

impact(9.0, 0.75)

# Electronic pulse
notes = [
    220,
    277,
    330,
    440
]

for i, note in enumerate(notes):

    add_tone(
        9.5 + i * 0.65,
        0.35,
        note,
        0.12,
        "square"
    )

# Second pulse section
for i, note in enumerate(notes):

    add_tone(
        12.2 + i * 0.45,
        0.3,
        note,
        0.10,
        "square"
    )

# Rise toward target
add_tone(
    13.0,
    2.0,
    180,
    0.10,
    "saw",
    1000
)


# =========================================
# TARGET — 15 to 19
# =========================================

# Tension bass
add_tone(
    15,
    4,
    65,
    0.16,
    "sine"
)

# Target beeps
for t in [15.2, 16.2, 17.2]:

    add_tone(
        t,
        0.12,
        880,
        0.22,
        "sine"
    )

    add_tone(
        t + 0.14,
        0.12,
        1320,
        0.18,
        "sine"
    )

# Rising tension
add_tone(
    17.0,
    2.0,
    150,
    0.13,
    "saw",
    1200
)


# =========================================
# GAMING ROOM DROP — 19 to 22
# =========================================

# BIG DROP
impact(19.0, 1.0)

add_tone(
    19.0,
    1.2,
    45,
    0.38,
    "sine",
    30
)

# Gaming rhythm
for t in [19.5, 20.0, 20.5, 21.0, 21.5]:

    add_tone(
        t,
        0.18,
        55,
        0.25,
        "saw"
    )

# Bright gaming synth
for i, note in enumerate([
    220, 277, 330, 440, 330, 277
]):

    add_tone(
        19.3 + i * 0.4,
        0.28,
        note,
        0.12,
        "square"
    )


# =========================================
# FINAL — 22 to 29.15
# =========================================

# Main final theme
melody = [
    (220, 22.0),
    (277, 22.6),
    (330, 23.2),
    (440, 23.8),
    (330, 24.4),
    (440, 25.0),
    (554, 25.6),
]

for note, t in melody:

    add_tone(
        t,
        0.5,
        note,
        0.14,
        "square"
    )


# Final riser
add_tone(
    25.5,
    2.7,
    180,
    0.10,
    "saw",
    1400
)


# Final lightning
lightning(26.8)

# Final impact
impact(28.35, 1.0)

add_tone(
    28.35,
    0.7,
    440,
    0.18,
    "triangle",
    880
)


# =========================================
# LIMIT / NORMALIZE
# =========================================

peak = max(
    abs(x)
    for x in audio
)

if peak > 0:

    scale = 0.85 / peak

    audio = [
        x * scale
        for x in audio
    ]


# =========================================
# WRITE WAV
# =========================================

output = (
    "audio/music/gamestorm-theme.wav"
)

with wave.open(output, "wb") as wav:

    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(SAMPLE_RATE)

    frames = bytearray()

    for sample in audio:

        sample = max(
            -1,
            min(1, sample)
        )

        frames.extend(
            struct.pack(
                "<h",
                int(sample * 32767)
            )
        )

    wav.writeframes(frames)


print()
print("🎵 GameStorm Legends music generated!")
print()
print("File:")
print(output)
print()
print("Duration:", DURATION, "seconds")
print("Sample rate:", SAMPLE_RATE)
