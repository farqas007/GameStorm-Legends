import librosa
import csv

audio_file = "assets/music/gamestorm-legends-main.mp3"
output_file = "beats.csv"

print("🎵 Loading:", audio_file)

y, sr = librosa.load(audio_file, sr=None, mono=True)

print(f"⏱️ Duration: {len(y) / sr:.2f}s")
print("🥁 Detecting beats...")

tempo, beat_frames = librosa.beat.beat_track(
    y=y,
    sr=sr
)

beat_times = librosa.frames_to_time(
    beat_frames,
    sr=sr
)

print(f"🎚️ BPM: {float(tempo[0]):.2f}")
print(f"🥁 Beats detected: {len(beat_times)}")

with open(output_file, "w", newline="") as f:

    writer = csv.writer(f)

    writer.writerow([
        "beat",
        "time"
    ])

    for i, time in enumerate(beat_times, start=1):

        writer.writerow([
            i,
            f"{time:.3f}"
        ])

print()
print("✅ beats.csv created!")
print("📄 Output:", output_file)
