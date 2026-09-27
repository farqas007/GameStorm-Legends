import librosa
import csv
import numpy as np

AUDIO = "assets/music/gamestorm-legends-main.mp3"
OUTPUT = "music_analysis.csv"
LIMIT = 92.447

print(f"🎵 Loading: {AUDIO}")

y, sr = librosa.load(AUDIO, sr=None, mono=True)

duration = librosa.get_duration(y=y, sr=sr)

print(f"⏱️ Duration: {duration:.2f}s")
print("🔍 Analyzing music...")

# -----------------------------
# BEATS
# -----------------------------
tempo, beat_frames = librosa.beat.beat_track(
    y=y,
    sr=sr
)

tempo_value = float(np.asarray(tempo).reshape(-1)[0])

beat_times = librosa.frames_to_time(
    beat_frames,
    sr=sr
)

# -----------------------------
# ONSETS
# -----------------------------
onset_frames = librosa.onset.onset_detect(
    y=y,
    sr=sr,
    units="frames",
    backtrack=False
)

onset_times = librosa.frames_to_time(
    onset_frames,
    sr=sr
)

# -----------------------------
# ENERGY
# -----------------------------
rms = librosa.feature.rms(y=y)[0]

rms_times = librosa.times_like(
    rms,
    sr=sr
)

# Normalize energy 0 → 1
energy_min = float(np.min(rms))
energy_max = float(np.max(rms))

if energy_max > energy_min:
    energy_normalized = (
        (rms - energy_min) /
        (energy_max - energy_min)
    )
else:
    energy_normalized = np.zeros_like(rms)


def get_energy(time):
    index = int(np.argmin(np.abs(rms_times - time)))
    return float(energy_normalized[index])


# -----------------------------
# CREATE TIMELINE
# -----------------------------
events = []

for time in beat_times:
    if time <= LIMIT:
        events.append({
            "time": float(time),
            "beat": 1,
            "onset": 0
        })

for time in onset_times:
    if time <= LIMIT:
        events.append({
            "time": float(time),
            "beat": 0,
            "onset": 1
        })

# Sort by time
events.sort(key=lambda x: x["time"])


# -----------------------------
# MERGE NEAR EVENTS
# -----------------------------
merged = []

for event in events:

    if not merged:
        merged.append(event)
        continue

    previous = merged[-1]

    # Events within 50ms are considered the same moment
    if abs(event["time"] - previous["time"]) <= 0.05:

        previous["beat"] = max(
            previous["beat"],
            event["beat"]
        )

        previous["onset"] = max(
            previous["onset"],
            event["onset"]
        )

    else:
        merged.append(event)


# -----------------------------
# WRITE CSV
# -----------------------------
with open(
    OUTPUT,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.writer(file)

    writer.writerow([
        "time",
        "beat",
        "onset",
        "energy"
    ])

    for event in merged:

        energy = get_energy(event["time"])

        writer.writerow([
            f"{event['time']:.3f}",
            event["beat"],
            event["onset"],
            f"{energy:.3f}"
        ])


print()
print("✅ Music analysis complete!")
print(f"🎚️ BPM: {tempo_value:.2f}")
print(f"🥁 Beats: {sum(e['beat'] for e in merged)}")
print(f"⚡ Events: {len(merged)}")
print(f"📄 Output: {OUTPUT}")
