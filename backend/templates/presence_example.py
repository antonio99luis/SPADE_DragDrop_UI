import getpass
import asyncio

import spade
from spade.agent import Agent
from spade.behaviour import OneShotBehaviour
from spade.presence import PresenceType, PresenceShow, PresenceInfo


class Agent1(Agent):
    async def setup(self):
        print(f"Agent {self.name} running")
        self.add_behaviour(self.Behav1())

    class Behav1(OneShotBehaviour):
        def on_available(self, peer_jid, presence_info, last_presence):
            print(f"[{self.agent.name}] Agent {peer_jid.split('@')[0]} is {presence_info.show.value}")

        def on_subscribed(self, peer_jid):
            print(f"[{self.agent.name}] Agent {peer_jid.split('@')[0]} has accepted the subscription")
            contacts = self.agent.presence.get_contacts()
            print(f"[{self.agent.name}] Contacts List: {contacts}")

        def on_subscribe(self, peer_jid):
            print(f"[{self.agent.name}] Agent {peer_jid.split('@')[0]} asked for subscription. Let's approve it")
            self.presence.approve_subscription(peer_jid)

        async def run(self):
            self.presence.on_subscribe = self.on_subscribe
            self.presence.on_subscribed = self.on_subscribed
            self.presence.on_available = self.on_available

            self.presence.set_presence(
                presence_type=PresenceType.AVAILABLE,
                show=PresenceShow.CHAT,
                status="Ready to chat"
            )
            self.presence.subscribe(self.agent.jid2)


class Agent2(Agent):
    async def setup(self):
        print(f"Agent {self.name} running")
        self.add_behaviour(self.Behav2())

    class Behav2(OneShotBehaviour):
        def on_available(self, peer_jid, presence_info, last_presence):
            print(f"[{self.agent.name}] Agent {peer_jid.split('@')[0]} is {presence_info.show.value}")

        def on_subscribed(self, peer_jid):
            print(f"[{self.agent.name}] Agent {peer_jid.split('@')[0]} has accepted the subscription")
            contacts = self.agent.presence.get_contacts()
            print(f"[{self.agent.name}] Contacts List: {contacts}")

        def on_subscribe(self, peer_jid):
            print(f"[{self.agent.name}] Agent {peer_jid.split('@')[0]} asked for subscription. Let's approve it")
            self.presence.approve_subscription(peer_jid)
            self.presence.subscribe(peer_jid)

        async def run(self):
            self.presence.set_presence(
                presence_type=PresenceType.AVAILABLE,
                show=PresenceShow.CHAT,
                status="Ready to chat"
            )
            self.presence.on_subscribe = self.on_subscribe
            self.presence.on_subscribed = self.on_subscribed
            self.presence.on_available = self.on_available


async def main():
    jid1 = input("Agent1 JID> ")
    passwd1 = getpass.getpass()

    jid2 = input("Agent2 JID> ")
    passwd2 = getpass.getpass()

    agent2 = Agent2(jid2, passwd2)
    agent1 = Agent1(jid1, passwd1)
    agent1.jid2 = jid2
    agent2.jid1 = jid1
    await agent2.start()
    await agent1.start()

    while True:
        try:
            await asyncio.sleep(1)
        except KeyboardInterrupt:
            break
    await agent1.stop()
    await agent2.stop()


if __name__ == "__main__":
    spade.run(main())