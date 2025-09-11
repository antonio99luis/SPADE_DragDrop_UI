import asyncio
import spade


async def main():
    
    while True:
        try:
            await asyncio.sleep(1)
        except KeyboardInterrupt:
            break



if __name__ == "__main__":
    spade.run(main())