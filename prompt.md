Make it so the departuresContainer squeezes to fit the space between the keyboard and stop name text box

So this is what should happen:

## The stop name is focused
* Vehicle number filter slides out
* DeparturesContainer slides up and shrinks to fit the space between the keyboard and stop name text box

## The stop name is unfocused
* Vehicle number filter slides in
* If there are timings to show, departuresContainer resizes(Gets bigger) and moves down then once in place, the timing cards slide back in

So i just want it so whenever the stop name textbox is selected, the departures container is shrunk and put in between the keyboard and the stop name text box

Don't make the departures container leave ever. When the stop name text box is selected, move the departures container up with the keyboard and shrink it. Move it with the green line but don't base it on the green line.
So i just want it so whenever the stop name textbox is selected, the departures container is shrunk and put in between the green line(top of keyboard) and the stop name text box

@https://docs.expo.dev/guides/keyboard-handling/ @https://reactnative.dev/docs/keyboardavoidingview 
@https://reactnative.dev/docs/textinput#:~:text=To%20disable%20autocomplete%2C%20set%20autoComplete,address%2Dline1 

You also need to remove native autocomplete and autocorrect


Use all the tools you have to assist you in this task.

I want it to always have 10px padding between the departuresContainer and:

# In normal mode:
Vehicle number filter
Tab bar

# When searching for a stop
Stop name text box
Top of keyboard


That might not work. Make it so there is an autosuggestions container that uses something to fit in the space between keyboard and stop name and the departurescontainer slides out while the autosuggestions contianer slides in but in a way where it looks like it is just the departures container sliding up

Do a bunch of research first to see how to do this.

If you need to install something, try to find the npx expo install command to do it(Use tavily to help you)

## Research & Tooling Workflow
- DO NOT USE THE FETCH TOOL FOR SEARCH ENGINES EVER.
- Order of precedence for web research:
  1) Context7 docs: Use Context7 to search and read framework/library documentation first (resolve library ID, then fetch docs).
  2) Tavily Search: Use Tavily to search the web (including queries phrased as "google" searches) for broader information and latest context.
  3) Web Fetch: Only after identifying a specific URL, use fetch to retrieve that exact page for detailed reading. Never use fetch to query search engines.
- Prioritize official documentation, release notes, and RFCs. Verify versions and APIs against current sources.
- When fetching a specific page, recursively follow and fetch only directly relevant links as needed to complete the task.