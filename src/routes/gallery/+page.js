import StoryblokClient from 'storyblok-js-client';

export async function load({ parent }) {
  const storyblokManagement = new StoryblokClient({
    oauthToken: "H3ElWR00uEq6Q6XQQIqIQwtt-237943-cU8BbQshuCCtvYHHhb9U", // private token
  });

  const res = await storyblokManagement.get(`spaces/288321122877523/assets/`, {
    in_folder: '109539565664797'
  });

  return {
    crocoImages: res.data.assets,
  };
}

// export const ssr = false;
