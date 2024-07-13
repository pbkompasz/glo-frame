import { Button } from "frames.js/next";
import { frames } from "./frames";
import cron from "node-cron";

const TOPICS = ["healthcare", "homeless", "crypto"];

let topicOfTheDay = TOPICS[0];

// Cron job, pick charity of the day

const task = cron.schedule(
  "0 0 * * *",
  () => {
    const randomPos = Math.floor(Math.random() * TOPICS.length);
    topicOfTheDay = TOPICS[randomPos];
    console.log(`New topic of the day: ${topicOfTheDay}`);
  },
  {
    scheduled: true,
  }
);

task.start();

// Charities

const searchCharities = async (searchTerm: string, offset: number) => {
  try {
    const rawResp = await fetch(
      `https://api.endaoment.org/v1/sdk/orgs/search?searchTerm=${searchTerm}&count=10&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const resp = await rawResp.json();
    return resp[0];
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

const getCharityOfTheDay = async () => {
  const randomOffset = Math.floor(Math.random() * 200);
  return await searchCharities(topicOfTheDay, randomOffset);
};

const getRandomCharity = async () => {
  const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  const randomOffset = Math.floor(Math.random() * 200);
  return await searchCharities(randomChar, randomOffset);
};

const handleRequest = frames(async (ctx) => {
  let image;
  let buttons;
  const oldState = ctx.state;
  const newState = {
    ...oldState,
  };

  switch (ctx.searchParams.value) {
    case "charity-otd":
      const charityOfTheDay = await getCharityOfTheDay();
      image = charityOfTheDay.name;
      newState.address = charityOfTheDay.contractAddress;
      buttons = [
        <Button action="tx" target={{ pathname: 'txdata', query: { address: charityOfTheDay.contractAddress, amount: 1 } }} post_url="/">
          Donate 1 USDGLO
        </Button>,
        <Button action="tx" target={{ pathname: 'txdata', query: { address: charityOfTheDay.contractAddress, amount: 10 } }} post_url="/">
          Donate 10 USDGLO
        </Button>,
        <Button action="tx" target={{ pathname: 'txdata', query: { address: charityOfTheDay.contractAddress, amount: 100 } }} post_url="/">
          Donate 100 USDGLO
        </Button>,
        <Button action="post" target={{ query: { value: "charity-rand" } }}>
          Select a random charity instead
        </Button>,
      ];
      break;

    case "charity-rand":
      const randomCharity = await getRandomCharity();
      image = randomCharity.name;
      newState.address = randomCharity.contractAddress;
      buttons = [
        <Button action="tx" target={{ pathname: 'txdata', query: { address: randomCharity.contractAddress, amount: 1 } }} post_url="/">
          Donate 1 USDGLO
        </Button>,
        <Button action="tx" target={{ pathname: 'txdata', query: { address: randomCharity.contractAddress, amount: 10 } }} post_url="/">
          Donate 10 USDGLO
        </Button>,
        <Button action="tx" target={{ pathname: 'txdata', query: { address: randomCharity.contractAddress, amount: 100 } }} post_url="/">
          Donate 100 USDGLO
        </Button>,
        <Button action="post" target={{ query: { value: "charity-rand" } }}>
          Another one
        </Button>,
      ];
      break;

    case "donate-1":
    case "donate-10":
    case "donate-100":
      try {
        const amount = ctx.searchParams.value.split("-").pop() as string;
        // return donate(+amount, ctx.state.address);
      } catch (error) {
        image;
      }
      break;

    case "donate-success":
      image = "Thank you for donating";
      buttons = [
        <Button action="link" target="TODO">
          Share
        </Button>,
      ];
      break;

    case "donate-error-1":
    case "donate-error-10":
    case "donate-error-100":
      const amount = ctx.searchParams.value.split("-").pop();
      image = "Error donation";
      buttons = [
        <Button action="post" target={{ query: { value: `donate-${amount}` } }}>
          Try again
        </Button>,
      ];
      break;
    default:
      image = "Welcome";
      buttons = [
        <Button action="post" target={{ query: { value: "charity-rand" } }}>
          View a random charity
        </Button>,
        <Button action="post" target={{ query: { value: "charity-otd" } }}>
          View the charity of the day
        </Button>,
      ];
      break;
  }

  return {
    image: <span>{image}</span>,
    buttons,
    state: newState,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
