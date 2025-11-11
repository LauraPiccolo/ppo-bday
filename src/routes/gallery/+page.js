import StoryblokClient from 'storyblok-js-client';

export async function load({ parent }) {
  const storyblokManagement = new StoryblokClient({
    oauthToken: "C4GK6qBPrnQEOzW6JdDQ9gtt-76603-RETtAmSBRqJ2CH1YfMz_", // private token
  });

  const res = await storyblokManagement.get(`spaces/288321122877523/assets/`, {
    in_folder: '109539565664797'
  });

  return {
    crocoImages: res.data.assets,
  };
}
// export const ssr = false;
