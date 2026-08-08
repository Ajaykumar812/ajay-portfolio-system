import os
from gtts import gTTS

dialogues = [
    "Chacha, thoda side se cut karna... bas decent lagna chahiye.",
    "Arey beta! Amrendra Hair salon me aaye ho... bilkul hero bana denge!",
    "Arey re... thoda haath slip ho gaya... par koi baat nahi...",
    "Arey chacha! Yeh kya kiya? Katora cut bana diya! Mujhe ganja nahi hona tha!",
    "Arey fikar mat karo beta... is cut me dhoop me bhi thandak milegi... style ka style!"
]

slide_dir = "c:/Users/ak731/Desktop/DSA/Portfolio Management System/barber_slides"
for i, text in enumerate(dialogues):
    path = os.path.join(slide_dir, f"audio_{i}.mp3")
    print(f"Generating TTS for scene {i}: {text}")
    tts = gTTS(text=text, lang='hi')
    tts.save(path)