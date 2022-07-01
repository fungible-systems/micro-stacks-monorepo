<script lang="ts">

  const { authenticate, isLoading, signOut, isSignedIn } = {};

  $: label = isLoading ? 'Loading...' : isSignedIn ? 'Sign out' : 'Connect Stacks wallet';
</script>

<main>
   <button>{label}</button>
</main>

<style></style>
