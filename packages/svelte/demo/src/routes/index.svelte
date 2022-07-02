<script lang="ts">
  import { mountClient, getAuth } from '@micro-stacks/svelte';

  mountClient({ appName: 'New Remix App', appIconUrl: 'https://remix.run/remix-v1.jpg' });

  console.log(mountClient, getAuth);
  const { authenticate, isLoading, signOut, isSignedIn } = getAuth();

  $: label = isLoading ? 'Loading...' : isSignedIn ? 'Sign out' : 'Connect Stacks wallet';

  function onClick() {
    if (isSignedIn) {
      signOut();
    } else {
      authenticate();
    }
  }
</script>

<main>
  <button on:click={onClick}>
    {label}
  </button>
</main>

<style></style>
