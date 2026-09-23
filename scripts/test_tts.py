import asyncio
import edge_tts

async def run():
    communicate = edge_tts.Communicate("Hello developers! Welcome to educational AI videos.", "en-US-ChristopherNeural")
    submaker = edge_tts.SubMaker()
    async for chunk in communicate.stream():
        if chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            submaker.feed(chunk)
    print("SRT output:\n", submaker.get_srt())

if __name__ == "__main__":
    asyncio.run(run())
