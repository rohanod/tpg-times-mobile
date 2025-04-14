

---
# faq.md

---
id: faq
title: FAQ
description: Bottom Sheet FAQ.
image: /img/bottom-sheet-preview.gif
slug: /faq
hide_table_of_contents: true
---

### How this library differ from `reanimated-bottom-sheet` or `react-native-scroll-bottom-sheet`?

This library was built to provide the most native-like experience and could fit any use-case that developers wants it to be. While both libraries providing similar experience, but they still missing the following:

- `reanimated-bottom-sheet`: Seamless gesture interaction between the sheet and the content.
- `react-native-scroll-bottom-sheet`: Extracting scrollable content to allow developers customize the sheet content, like integrate React Navigation as the sheet content.

Both libraries are great! and I have used both of them at my work ❤️


---
# hooks.md

---
id: hooks
title: Hooks
description: Bottom Sheet hooks.
image: /img/bottom-sheet-preview.gif
slug: /hooks
---

## useBottomSheet

This hook provides all the bottom sheet public [methods](methods) and `animatedIndex` & `animatedPosition`, to the internal sheet content or handle.

:::info

This hook works at any component inside the `BottomSheet`.

:::

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useBottomSheet } from '@gorhom/bottom-sheet';

const SheetContent = () => {
  const { expand } = useBottomSheet();

  return (
    <View>
      <Button onPress={expand}>
    </View>
  )
}
```

## useBottomSheetSpringConfigs

Generate animation spring configs.

```tsx
import React from 'react';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

const SheetContent = () => {

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  return (
    <BottomSheet
      // ... other props
      animationConfigs={animationConfigs}
    >
      {CONTENT HERE}
    </BottomSheet>
  )
}
```

## useBottomSheetTimingConfigs

Generate animation timing configs.

```tsx
import React from 'react';
import BottomSheet, { useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';

const SheetContent = () => {

  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 250,
    easing: Easing.exp,
  });

  return (
    <BottomSheet
      // ... other props
      animationConfigs={animationConfigs}
    >
      {CONTENT HERE}
    </BottomSheet>
  )
}
```


---
# index.md

---
id: index
title: Bottom Sheet
hide_title: true
sidebar_label: Bottom Sheet
description: A performant interactive bottom sheet with fully configurable options 🚀
image: /img/bottom-sheet-preview.gif
slug: /
---

<head>
  <title>React Native Bottom Sheet</title>
</head>

# React Native Bottom Sheet

[![Reanimated v3 version](https://img.shields.io/github/package-json/v/gorhom/react-native-bottom-sheet/master?label=Reanimated%20v3&style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet) [![Reanimated v2 version](https://img.shields.io/github/package-json/v/gorhom/react-native-bottom-sheet/v4?label=Reanimated%20v2&style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet)  [![Reanimated v1 version](https://img.shields.io/github/package-json/v/gorhom/react-native-bottom-sheet/v2?label=Reanimated%20v1&style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet)<br />
[![license](https://img.shields.io/npm/l/@gorhom/bottom-sheet?style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet) [![npm](https://img.shields.io/badge/types-included-blue?style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet) [![runs with expo](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.io/) <br /> ![NPM Downloads](https://img.shields.io/npm/dw/%40gorhom%2Fbottom-sheet?style=flat-square)

A performant interactive bottom sheet with fully configurable options 🚀

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
	title="React Native Bottom Sheet"
	url={useBaseUrl("video/bottom-sheet-preview.mp4")}
	img={useBaseUrl("img/bottom-sheet-preview.gif")}
/>

## Features

- ⭐️ Support React Native Web, [read more](./web-support).
- ⭐️ Dynamic Sizing, [read more](./dynamic-sizing).
- ⭐️ Support FlashList, [read more](./components/bottomsheetflashlist).
- Modal presentation view, [Bottom Sheet Modal](./modal).
- Smooth gesture interactions & snapping animations.
- Seamless [keyboard handling](./keyboard-handling) for iOS & Android.
- Support [pull to refresh](./pull-to-refresh) for scrollables.
- Support `FlatList`, `SectionList`, `ScrollView` & `View` scrolling interactions, [read more](./scrollables).
- Support `React Navigation` Integration, [read more](./react-navigation-integration).
- Compatible with `Reanimated` v1-3.
- Accessibility support.
- Written in `TypeScript`.

## Installation

```bash
yarn add @gorhom/bottom-sheet@^5
```

#### Dependencies

This library needs these dependencies to be installed in your project before you can use it:

```bash
yarn add react-native-reanimated react-native-gesture-handler
```

Using Expo?

```bash
npx expo install react-native-reanimated react-native-gesture-handler
```

:::info
**React Native Gesture Handler v2** needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation). Please **make sure** to wrap your App with `GestureHandlerRootView` when you've upgraded to React Native Gesture Handler ^2.

**React Native Reanimated v3** needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).
:::

## Sponsor & Support

To keep this library maintained and up-to-date please consider [sponsoring it on GitHub](https://github.com/sponsors/gorhom). Or if you are looking for a private support or help in customizing the experience, then reach out to me on Twitter [@gorhom](https://twitter.com/gorhom).

## Built With ❤️

- [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)
- [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler)
- [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob)


---
# methods.md

---
id: methods
title: Methods
description: Bottom Sheet methods.
image: /img/bottom-sheet-preview.gif
slug: /methods
---

These methods are accessible using the bottom sheet reference or the hook `useBottomSheet` or `useBottomSheetModal`.

```tsx
import React, { useRef } from 'react';
import { Button } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const App = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleClosePress = () => bottomSheetRef.current.close()

  return (
    <>
      <Button title="Close Sheet" onPress={handleClosePress} />
      <BottomSheet ref={bottomSheetRef}>
    </>
  )
}

```

### snapToIndex

Snap to one of the provided points from `snapPoints`.

```ts
type snapToIndex = (
  // snap point index.
  index: number,
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### snapToPosition

Snap to a position out of provided `snapPoints`.

```ts
type snapToPosition = (
  // position in pixel or percentage.
  position: number,
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### expand

Snap to the maximum provided point from `snapPoints`.

```ts
type expand = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### collapse

Snap to the minimum provided point from `snapPoints`.

```ts
type collapse = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### close

Close the bottom sheet.

```ts
type close = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### forceClose

Force close the bottom sheet, this prevent any interruptions till the sheet is closed.

```ts
type forceClose = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```


---
# props.md

---
id: props
title: Props
description: Bottom Sheet configurable props.
image: /img/bottom-sheet-preview.gif
slug: /props
---

## Configuration

### index

Initial snap index. You also could provide `-1` to initiate bottom sheet in closed state.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### snapPoints

Points for the bottom sheet to snap to, **points should be sorted from bottom to top**. It accepts array of number, string or mix.

| type                                                          | required |
| ------------------------------------------------------------- | -------- |
| Array\<number\|string> \| SharedValue\<Array\<string \| number>> | YES\*    |

:::caution
This prop is required if you set `enableDynamicSizing` to `false` (it's `true` by default). 
:::
:::caution
String values should be a percentage.
:::

#### examples

```ts
snapPoints={[200, 500]}
snapPoints={[200, '50%']}
snapPoints={['100%']}
```

### overDragResistanceFactor

Defines how violently sheet has to be stopped while over dragging.

| type   | default | required |
| ------ | ------- | -------- |
| number | 2.5     | NO       |

### detached

Defines whether the bottom sheet is attached to the bottom or no.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false   | NO       |

### enableContentPanningGesture

Enable content panning gesture interaction.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### enableHandlePanningGesture

Enable handle panning gesture interaction.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### enableOverDrag

Enable over drag for the sheet.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### enablePanDownToClose

Enable pan down gesture to close the sheet.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false   | NO       |

### enableDynamicSizing

Enable dynamic sizing for content view and scrollable content size.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

:::caution

Setting this prop to `true`, will result in adding a new snap point to the provided snap points and will be sorted accordingly, and this might effect the indexing, for example, if provided snap points are `[100, 1000]`, and the content size is `500` then the final snap points will be `[100, 500, 1000]`.

:::

### animateOnMount

This will initially mount the sheet closed and when it's mounted and calculated the layout, it will snap to initial snap point index.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### overrideReduceMotion

To override the user reduce motion accessibility setting, [read more](https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility).

- `ReduceMotion.System`: if the `Reduce motion` accessibility setting is enabled on the device, disable the animation.
- `ReduceMotion.Always`: disable the animation, even if `Reduce motion` accessibility setting is not enabled.
- `ReduceMotion.Never`: enable the animation, even if `Reduce motion` accessibility setting is enabled.

| type    | default | required |
| ------- | ------- | -------- |
| ReduceMotion | ReduceMotion.System    | NO       |

## Styles

### style

View style to be applied at the sheet container, it also could be an `AnimatedStyle`. This is helpful to add shadow to the sheet.

| type                       | default   | required |
| -------------------------- | --------- | -------- |
| ViewStyle \| AnimatedStyle | undefined | NO       |

### backgroundStyle

View style to be applied to the background component.

| type      | default   | required |
| --------- | --------- | -------- |
| ViewStyle | undefined | NO       |

### handleStyle

View style to be applied to the handle component.

| type      | default   | required |
| --------- | --------- | -------- |
| ViewStyle | undefined | NO       |

### handleIndicatorStyle

View style to be applied to the handle indicator component.

| type      | default   | required |
| --------- | --------- | -------- |
| ViewStyle | undefined | NO       |

## Layout Configuration

### handleHeight

Handle height helps to calculate the internal container and sheet layouts. If `handleComponent` is provided, the library internally will calculate its layout, unless `handleHeight` is provided too.

| type   | default | required |
| ------ | ------- | -------- |
| number | 24      | NO       |

### containerHeight

Container height helps to calculate the internal sheet layouts. If `containerHeight` not provided, the library internally will calculate it, however this will cause an extra re-rendering.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### contentHeight

Content height helps dynamic snap points calculation.

| type                                    | default   | required |
| --------------------------------------- | --------- | -------- |
| number \| Animated.SharedValue\<number\> | undefined | NO       |

### containerOffset

Container offset helps to accurately detect container offsets.

| type                          | default   | required |
| ----------------------------- | --------- | -------- |
| Animated.SharedValue\<Insets\> | undefined | NO       |

### topInset

Top inset to be added to the bottom sheet container, usually it comes from `@react-navigation/stack` hook `useHeaderHeight` or from `react-native-safe-area-context` hook `useSafeArea`.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### bottomInset

Bottom inset to be added to the bottom sheet container.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### maxDynamicContentSize

Max dynamic content size height to limit the bottom sheet height from exceeding a provided size.

| type   | default          | required |
| ------ | ---------------- | -------- |
| number | container height | NO       |

## Keyboard Configuration

### keyboardBehavior

Defines the keyboard appearance behavior.

- `extend`: extend the sheet to its maximum snap point.
- `fillParent`: extend the sheet to fill the parent view.
- `interactive`: offset the sheet by the size of the keyboard.

| type                                      | default       | required |
| ----------------------------------------- | ------------- | -------- |
| 'extend' \| 'fillParent' \| 'interactive' | 'interactive' | NO       |

### keyboardBlurBehavior

Defines the keyboard blur behavior.

- `none`: do nothing.
- `restore`: restore sheet position.

| type                | default | required |
| ------------------- | ------- | -------- |
| 'none' \| 'restore' | 'none'  | NO       |

### enableBlurKeyboardOnGesture

Enable blurring the keyboard when user start to drag the bottom sheet.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false    | NO       |

### android_keyboardInputMode

Defines keyboard input mode for `Android` only, [learn more](https://developer.android.com/guide/topics/manifest/activity-element#wsoft).

| type                          | default     | required |
| ----------------------------- | ----------- | -------- |
| 'adjustPan' \| 'adjustResize' | 'adjustPan' | NO       |

## Animation Configuration

### animationConfigs

Animation configs, this could be created by:

- [`useBottomSheetSpringConfigs`](./hooks#usebottomsheetspringconfigs)
- [`useBottomSheetTimingConfigs`](./hooks#usebottomsheettimingconfigs)

```ts
type animationConfigs = (
	point: number,
	velocity: number,
	callback: () => void
) => number;
```

| type     | default   | required |
| -------- | --------- | -------- |
| function | undefined | NO       |

## Gesture Configuration

### waitFor

[Read about `waitFor`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-common#waitfor).

| type                     | default | required |
| ------------------------ | ------- | -------- |
| React.Ref \| React.Ref[] | []      | NO       |

### simultaneousHandlers

[Read about `simultaneousHandlers`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-common#simultaneoushandlers).

| type                     | default | required |
| ------------------------ | ------- | -------- |
| React.Ref \| React.Ref[] | []      | NO       |

### activeOffsetX

[Read about `activeOffsetX`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan#activeoffsetx).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### activeOffsetY

[Read about `activeOffsetY`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan#activeoffsety).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### failOffsetX

[Read about `failOffsetX`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan/#failoffsetx).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### failOffsetY

[Read about `failOffsetY`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan/#failoffsety).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### gestureEventsHandlersHook

Custom hook to provide pan gesture events handler, which will allow advance and customize handling for pan gesture.

| type                          | default                         | required |
| ----------------------------- | ------------------------------- | -------- |
| GestureEventsHandlersHookType | useGestureEventsHandlersDefault | NO       |

> warning: this is an experimental feature and the hook signature can change without a major version bump.

## Animated Nodes

### animatedIndex

Animated value to be used as a callback for the index node internally.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue\<number\> | null    | NO       |

### animatedPosition

Animated value to be used as a callback for the position node internally.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue\<number\> | null    | NO       |

## Callbacks

### onChange

Callback when the sheet position changed.

```ts
type onChange = (index: number) => void;
```

| type     | default | required |
| -------- | ------- | -------- |
| function | null    | NO       |

### onAnimate

Callback when the sheet about to animate to a new position.

```ts
type onAnimate = (fromIndex: number, toIndex: number) => void;
```

| type     | default | required |
| -------- | ------- | -------- |
| function | null    | NO       |

## Components

### handleComponent

Component to be placed as a sheet handle.

| type                               | default             | required |
| ---------------------------------- | ------------------- | -------- |
| `React.FC\<BottomSheetHandleProps>` | `BottomSheetHandle` | NO       |

### backdropComponent

Component to be placed as a sheet backdrop, by default is set to `null`, however the library also provide a default implementation `BottomSheetBackdrop` of a backdrop but you will need to provide it manually.

| type                                   | default | required |
| -------------------------------------- | ------- | -------- |
| `React.FC\<BottomSheetBackgroundProps>` | null    | NO       |

### backgroundComponent

Component to be placed as a sheet background.

| type                                   | default                 | required |
| -------------------------------------- | ----------------------- | -------- |
| `React.FC\<BottomSheetBackgroundProps>` | `BottomSheetBackground` | NO       |

### footerComponent

Component to be placed as a sheet footer.

| type                               | default   | required |
| ---------------------------------- | --------- | -------- |
| `React.FC\<BottomSheetFooterProps>` | undefined | NO       |

### children

`Scrollable` node or react node to be places as a sheet content.

| type                                                          | default | required |
| ------------------------------------------------------------- | ------- | -------- |
| () => React.ReactNode \| React.ReactNode[] \| React.ReactNode | null    | YES      |


---
# reactNativeBottomSheet.md



---
# faq.md

---
id: faq
title: FAQ
description: Bottom Sheet FAQ.
image: /img/bottom-sheet-preview.gif
slug: /faq
hide_table_of_contents: true
---

### How this library differ from `reanimated-bottom-sheet` or `react-native-scroll-bottom-sheet`?

This library was built to provide the most native-like experience and could fit any use-case that developers wants it to be. While both libraries providing similar experience, but they still missing the following:

- `reanimated-bottom-sheet`: Seamless gesture interaction between the sheet and the content.
- `react-native-scroll-bottom-sheet`: Extracting scrollable content to allow developers customize the sheet content, like integrate React Navigation as the sheet content.

Both libraries are great! and I have used both of them at my work ❤️


---
# hooks.md

---
id: hooks
title: Hooks
description: Bottom Sheet hooks.
image: /img/bottom-sheet-preview.gif
slug: /hooks
---

## useBottomSheet

This hook provides all the bottom sheet public [methods](methods) and `animatedIndex` & `animatedPosition`, to the internal sheet content or handle.

:::info

This hook works at any component inside the `BottomSheet`.

:::

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useBottomSheet } from '@gorhom/bottom-sheet';

const SheetContent = () => {
  const { expand } = useBottomSheet();

  return (
    <View>
      <Button onPress={expand}>
    </View>
  )
}
```

## useBottomSheetSpringConfigs

Generate animation spring configs.

```tsx
import React from 'react';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

const SheetContent = () => {

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  return (
    <BottomSheet
      // ... other props
      animationConfigs={animationConfigs}
    >
      {CONTENT HERE}
    </BottomSheet>
  )
}
```

## useBottomSheetTimingConfigs

Generate animation timing configs.

```tsx
import React from 'react';
import BottomSheet, { useBottomSheetTimingConfigs } from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';

const SheetContent = () => {

  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 250,
    easing: Easing.exp,
  });

  return (
    <BottomSheet
      // ... other props
      animationConfigs={animationConfigs}
    >
      {CONTENT HERE}
    </BottomSheet>
  )
}
```


---
# index.md

---
id: index
title: Bottom Sheet
hide_title: true
sidebar_label: Bottom Sheet
description: A performant interactive bottom sheet with fully configurable options 🚀
image: /img/bottom-sheet-preview.gif
slug: /
---

<head>
  <title>React Native Bottom Sheet</title>
</head>

# React Native Bottom Sheet

[![Reanimated v3 version](https://img.shields.io/github/package-json/v/gorhom/react-native-bottom-sheet/master?label=Reanimated%20v3&style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet) [![Reanimated v2 version](https://img.shields.io/github/package-json/v/gorhom/react-native-bottom-sheet/v4?label=Reanimated%20v2&style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet)  [![Reanimated v1 version](https://img.shields.io/github/package-json/v/gorhom/react-native-bottom-sheet/v2?label=Reanimated%20v1&style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet)<br />
[![license](https://img.shields.io/npm/l/@gorhom/bottom-sheet?style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet) [![npm](https://img.shields.io/badge/types-included-blue?style=flat-square)](https://www.npmjs.com/package/@gorhom/bottom-sheet) [![runs with expo](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.io/) <br /> ![NPM Downloads](https://img.shields.io/npm/dw/%40gorhom%2Fbottom-sheet?style=flat-square)

A performant interactive bottom sheet with fully configurable options 🚀

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
	title="React Native Bottom Sheet"
	url={useBaseUrl("video/bottom-sheet-preview.mp4")}
	img={useBaseUrl("img/bottom-sheet-preview.gif")}
/>

## Features

- ⭐️ Support React Native Web, [read more](./web-support).
- ⭐️ Dynamic Sizing, [read more](./dynamic-sizing).
- ⭐️ Support FlashList, [read more](./components/bottomsheetflashlist).
- Modal presentation view, [Bottom Sheet Modal](./modal).
- Smooth gesture interactions & snapping animations.
- Seamless [keyboard handling](./keyboard-handling) for iOS & Android.
- Support [pull to refresh](./pull-to-refresh) for scrollables.
- Support `FlatList`, `SectionList`, `ScrollView` & `View` scrolling interactions, [read more](./scrollables).
- Support `React Navigation` Integration, [read more](./react-navigation-integration).
- Compatible with `Reanimated` v1-3.
- Accessibility support.
- Written in `TypeScript`.

## Installation

```bash
yarn add @gorhom/bottom-sheet@^5
```

#### Dependencies

This library needs these dependencies to be installed in your project before you can use it:

```bash
yarn add react-native-reanimated react-native-gesture-handler
```

Using Expo?

```bash
npx expo install react-native-reanimated react-native-gesture-handler
```

:::info
**React Native Gesture Handler v2** needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation). Please **make sure** to wrap your App with `GestureHandlerRootView` when you've upgraded to React Native Gesture Handler ^2.

**React Native Reanimated v3** needs extra steps to finalize its installation, please follow their [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).
:::

## Sponsor & Support

To keep this library maintained and up-to-date please consider [sponsoring it on GitHub](https://github.com/sponsors/gorhom). Or if you are looking for a private support or help in customizing the experience, then reach out to me on Twitter [@gorhom](https://twitter.com/gorhom).

## Built With ❤️

- [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)
- [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler)
- [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob)


---
# methods.md

---
id: methods
title: Methods
description: Bottom Sheet methods.
image: /img/bottom-sheet-preview.gif
slug: /methods
---

These methods are accessible using the bottom sheet reference or the hook `useBottomSheet` or `useBottomSheetModal`.

```tsx
import React, { useRef } from 'react';
import { Button } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const App = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleClosePress = () => bottomSheetRef.current.close()

  return (
    <>
      <Button title="Close Sheet" onPress={handleClosePress} />
      <BottomSheet ref={bottomSheetRef}>
    </>
  )
}

```

### snapToIndex

Snap to one of the provided points from `snapPoints`.

```ts
type snapToIndex = (
  // snap point index.
  index: number,
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### snapToPosition

Snap to a position out of provided `snapPoints`.

```ts
type snapToPosition = (
  // position in pixel or percentage.
  position: number,
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### expand

Snap to the maximum provided point from `snapPoints`.

```ts
type expand = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### collapse

Snap to the minimum provided point from `snapPoints`.

```ts
type collapse = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### close

Close the bottom sheet.

```ts
type close = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```

### forceClose

Force close the bottom sheet, this prevent any interruptions till the sheet is closed.

```ts
type forceClose = (
  // snap animation configs
  animationConfigs?: Animated.WithSpringConfig | Animated.WithTimingConfig
) => void;
```


---
# props.md

---
id: props
title: Props
description: Bottom Sheet configurable props.
image: /img/bottom-sheet-preview.gif
slug: /props
---

## Configuration

### index

Initial snap index. You also could provide `-1` to initiate bottom sheet in closed state.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### snapPoints

Points for the bottom sheet to snap to, **points should be sorted from bottom to top**. It accepts array of number, string or mix.

| type                                                          | required |
| ------------------------------------------------------------- | -------- |
| Array\<number\|string> \| SharedValue\<Array\<string \| number>> | YES\*    |

:::caution
This prop is required if you set `enableDynamicSizing` to `false` (it's `true` by default). 
:::
:::caution
String values should be a percentage.
:::

#### examples

```ts
snapPoints={[200, 500]}
snapPoints={[200, '50%']}
snapPoints={['100%']}
```

### overDragResistanceFactor

Defines how violently sheet has to be stopped while over dragging.

| type   | default | required |
| ------ | ------- | -------- |
| number | 2.5     | NO       |

### detached

Defines whether the bottom sheet is attached to the bottom or no.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false   | NO       |

### enableContentPanningGesture

Enable content panning gesture interaction.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### enableHandlePanningGesture

Enable handle panning gesture interaction.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### enableOverDrag

Enable over drag for the sheet.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### enablePanDownToClose

Enable pan down gesture to close the sheet.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false   | NO       |

### enableDynamicSizing

Enable dynamic sizing for content view and scrollable content size.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

:::caution

Setting this prop to `true`, will result in adding a new snap point to the provided snap points and will be sorted accordingly, and this might effect the indexing, for example, if provided snap points are `[100, 1000]`, and the content size is `500` then the final snap points will be `[100, 500, 1000]`.

:::

### animateOnMount

This will initially mount the sheet closed and when it's mounted and calculated the layout, it will snap to initial snap point index.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

### overrideReduceMotion

To override the user reduce motion accessibility setting, [read more](https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility).

- `ReduceMotion.System`: if the `Reduce motion` accessibility setting is enabled on the device, disable the animation.
- `ReduceMotion.Always`: disable the animation, even if `Reduce motion` accessibility setting is not enabled.
- `ReduceMotion.Never`: enable the animation, even if `Reduce motion` accessibility setting is enabled.

| type    | default | required |
| ------- | ------- | -------- |
| ReduceMotion | ReduceMotion.System    | NO       |

## Styles

### style

View style to be applied at the sheet container, it also could be an `AnimatedStyle`. This is helpful to add shadow to the sheet.

| type                       | default   | required |
| -------------------------- | --------- | -------- |
| ViewStyle \| AnimatedStyle | undefined | NO       |

### backgroundStyle

View style to be applied to the background component.

| type      | default   | required |
| --------- | --------- | -------- |
| ViewStyle | undefined | NO       |

### handleStyle

View style to be applied to the handle component.

| type      | default   | required |
| --------- | --------- | -------- |
| ViewStyle | undefined | NO       |

### handleIndicatorStyle

View style to be applied to the handle indicator component.

| type      | default   | required |
| --------- | --------- | -------- |
| ViewStyle | undefined | NO       |

## Layout Configuration

### handleHeight

Handle height helps to calculate the internal container and sheet layouts. If `handleComponent` is provided, the library internally will calculate its layout, unless `handleHeight` is provided too.

| type   | default | required |
| ------ | ------- | -------- |
| number | 24      | NO       |

### containerHeight

Container height helps to calculate the internal sheet layouts. If `containerHeight` not provided, the library internally will calculate it, however this will cause an extra re-rendering.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### contentHeight

Content height helps dynamic snap points calculation.

| type                                    | default   | required |
| --------------------------------------- | --------- | -------- |
| number \| Animated.SharedValue\<number\> | undefined | NO       |

### containerOffset

Container offset helps to accurately detect container offsets.

| type                          | default   | required |
| ----------------------------- | --------- | -------- |
| Animated.SharedValue\<Insets\> | undefined | NO       |

### topInset

Top inset to be added to the bottom sheet container, usually it comes from `@react-navigation/stack` hook `useHeaderHeight` or from `react-native-safe-area-context` hook `useSafeArea`.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### bottomInset

Bottom inset to be added to the bottom sheet container.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### maxDynamicContentSize

Max dynamic content size height to limit the bottom sheet height from exceeding a provided size.

| type   | default          | required |
| ------ | ---------------- | -------- |
| number | container height | NO       |

## Keyboard Configuration

### keyboardBehavior

Defines the keyboard appearance behavior.

- `extend`: extend the sheet to its maximum snap point.
- `fillParent`: extend the sheet to fill the parent view.
- `interactive`: offset the sheet by the size of the keyboard.

| type                                      | default       | required |
| ----------------------------------------- | ------------- | -------- |
| 'extend' \| 'fillParent' \| 'interactive' | 'interactive' | NO       |

### keyboardBlurBehavior

Defines the keyboard blur behavior.

- `none`: do nothing.
- `restore`: restore sheet position.

| type                | default | required |
| ------------------- | ------- | -------- |
| 'none' \| 'restore' | 'none'  | NO       |

### enableBlurKeyboardOnGesture

Enable blurring the keyboard when user start to drag the bottom sheet.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false    | NO       |

### android_keyboardInputMode

Defines keyboard input mode for `Android` only, [learn more](https://developer.android.com/guide/topics/manifest/activity-element#wsoft).

| type                          | default     | required |
| ----------------------------- | ----------- | -------- |
| 'adjustPan' \| 'adjustResize' | 'adjustPan' | NO       |

## Animation Configuration

### animationConfigs

Animation configs, this could be created by:

- [`useBottomSheetSpringConfigs`](./hooks#usebottomsheetspringconfigs)
- [`useBottomSheetTimingConfigs`](./hooks#usebottomsheettimingconfigs)

```ts
type animationConfigs = (
	point: number,
	velocity: number,
	callback: () => void
) => number;
```

| type     | default   | required |
| -------- | --------- | -------- |
| function | undefined | NO       |

## Gesture Configuration

### waitFor

[Read about `waitFor`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-common#waitfor).

| type                     | default | required |
| ------------------------ | ------- | -------- |
| React.Ref \| React.Ref[] | []      | NO       |

### simultaneousHandlers

[Read about `simultaneousHandlers`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-common#simultaneoushandlers).

| type                     | default | required |
| ------------------------ | ------- | -------- |
| React.Ref \| React.Ref[] | []      | NO       |

### activeOffsetX

[Read about `activeOffsetX`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan#activeoffsetx).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### activeOffsetY

[Read about `activeOffsetY`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan#activeoffsety).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### failOffsetX

[Read about `failOffsetX`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan/#failoffsetx).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### failOffsetY

[Read about `failOffsetY`](https://docs.swmansion.com/react-native-gesture-handler/docs/handler-pan/#failoffsety).

| type     | default   | required |
| -------- | --------- | -------- |
| number[] | undefined | NO       |

### gestureEventsHandlersHook

Custom hook to provide pan gesture events handler, which will allow advance and customize handling for pan gesture.

| type                          | default                         | required |
| ----------------------------- | ------------------------------- | -------- |
| GestureEventsHandlersHookType | useGestureEventsHandlersDefault | NO       |

> warning: this is an experimental feature and the hook signature can change without a major version bump.

## Animated Nodes

### animatedIndex

Animated value to be used as a callback for the index node internally.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue\<number\> | null    | NO       |

### animatedPosition

Animated value to be used as a callback for the position node internally.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue\<number\> | null    | NO       |

## Callbacks

### onChange

Callback when the sheet position changed.

```ts
type onChange = (index: number) => void;
```

| type     | default | required |
| -------- | ------- | -------- |
| function | null    | NO       |

### onAnimate

Callback when the sheet about to animate to a new position.

```ts
type onAnimate = (fromIndex: number, toIndex: number) => void;
```

| type     | default | required |
| -------- | ------- | -------- |
| function | null    | NO       |

## Components

### handleComponent

Component to be placed as a sheet handle.

| type                               | default             | required |
| ---------------------------------- | ------------------- | -------- |
| `React.FC\<BottomSheetHandleProps>` | `BottomSheetHandle` | NO       |

### backdropComponent

Component to be placed as a sheet backdrop, by default is set to `null`, however the library also provide a default implementation `BottomSheetBackdrop` of a backdrop but you will need to provide it manually.

| type                                   | default | required |
| -------------------------------------- | ------- | -------- |
| `React.FC\<BottomSheetBackgroundProps>` | null    | NO       |

### backgroundComponent

Component to be placed as a sheet background.

| type                                   | default                 | required |
| -------------------------------------- | ----------------------- | -------- |
| `React.FC\<BottomSheetBackgroundProps>` | `BottomSheetBackground` | NO       |

### footerComponent

Component to be placed as a sheet footer.

| type                               | default   | required |
| ---------------------------------- | --------- | -------- |
| `React.FC\<BottomSheetFooterProps>` | undefined | NO       |

### children

`Scrollable` node or react node to be places as a sheet content.

| type                                                          | default | required |
| ------------------------------------------------------------- | ------- | -------- |
| () => React.ReactNode \| React.ReactNode[] \| React.ReactNode | null    | YES      |


---
# scrollables.md

---
id: scrollables
title: Scrollables
description: Bottom Sheet scrollables.
image: /img/bottom-sheet-preview.gif
slug: /scrollables
---

This library provides a pre-integrated virtualized lists that utilize an internal functionalities with the bottom sheet container to allow smooth panning interactions. These lists I called them Scrollables and they are:

- [BottomSheetFlatList](./components/bottomsheetflatlist)
- [BottomSheetSectionList](./components/bottomsheetsectionlist)
- [BottomSheetScrollView](./components/bottomsheetscrollview)
- [BottomSheetVirtualizedList](./components/bottomsheetvirtualizedlist)
- [BottomSheetView](./components/bottomsheetview)


---
# troubleshooting.md

---
id: troubleshooting
title: Troubleshooting
description: Bottom Sheet troubleshooting.
image: /img/bottom-sheet-preview.gif
slug: /troubleshooting
hide_table_of_contents: true
---

This section attempts to outline issues that users frequently encounter when first getting accustomed to using React Native Bottom Sheet. These issues may or may not be related to React Native Bottom Sheet itself.

## Pressables / Touchables are not working on Android

Due to wrapping the content and handle with `TapGestureHandler` & `PanGestureHandler`, any gesture interaction would not function as expected.

To resolve this issue, please use touchables that this library provide.

```tsx
import {
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from '@gorhom/bottom-sheet';
```

## Adding horizontal FlatList or ScrollView is not working properly on Android

Due to wrapping the content and handle with `TapGestureHandler` & `PanGestureHandler`, any gesture interaction would not function as expected.

To resolve this issue, please use `ScrollView` & `FlatList` from `react-native-gesture-handler` provide instead `react-native`.

```tsx
import {
  ScrollView,
  FlatList
} from 'react-native-gesture-handler';
```

## My component gesture interaction gets conflicted with Bottom Sheet interactions ?

To avoid the gesture interaction conflict between the Bottom Sheet and its content, you will need to wrap your component with `NativeViewGestureHandler` from `react-native-gesture-handler`

```tsx
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

<NativeViewGestureHandler disallowInterruption={true}>
   <AwesomeComponent />
</NativeViewGestureHandler>
```


---
# usage.md

---
id: usage
title: Usage
description: Bottom Sheet usage.
image: /img/bottom-sheet-preview.gif
slug: /usage
---

Here is a simple usage of the **Bottom Sheet**, with non-scrollable content. For more scrollable usage please read [Scrollables](./scrollables).

```tsx
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const App = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});

export default App;
```

---
# components/bottomsheetbackdrop.md

---
id: bottomsheetbackdrop
title: BottomSheetBackdrop
sidebar_label: Backdrop
description: a pre-built BottomSheet backdrop implementation with configurable props.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetbackdrop
---

A pre-built BottomSheet backdrop implementation with configurable props.

## Props

Inherits `ViewProps` from `react-native`.

### animatedIndex

Current sheet position index.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue\<number> | 0       | YES      |

### animatedPosition

Current sheet position.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue<number/> | 0       | YES      |

### opacity

Backdrop opacity.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0.5     | NO       |

### appearsOnIndex

Snap point index when backdrop will appears on.

| type   | default | required |
| ------ | ------- | -------- |
| number | 1       | NO       |

### disappearsOnIndex

Snap point index when backdrop will disappears on.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### enableTouchThrough

Enable touch through backdrop component.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | false   | NO       |

### pressBehavior

What should happen when user press backdrop?

- `none`: do nothing, and `onPress` prop will be ignored.
- `close`: close the sheet.
- `collapse`: collapse the sheet.
- `N`: snap point index.

| type                              | default | required |
| --------------------------------- | ------- | -------- |
| `BackdropPressBehavior` \| number | 'close' | NO       |

### onPress

Pressing the backdrop will call the `onPress` function, it will be called before the action defined by `pressBehavior` is executed

| type     | default   | required |
| -------- | --------- | -------- |
| function | undefined | NO       |

## Example

```tsx
import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const App = () => {
	// ref
	const bottomSheetRef = useRef<BottomSheet>(null);

	// variables
	const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

	// callbacks
	const handleSheetChanges = useCallback((index: number) => {
		console.log("handleSheetChanges", index);
	}, []);

	// renders
	const renderBackdrop = useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={1}
				appearsOnIndex={2}
			/>
		),
		[]
	);
	return (
		<GestureHandlerRootView style={styles.container}>
			<BottomSheet
				ref={bottomSheetRef}
				index={1}
				snapPoints={snapPoints}
				backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
				onChange={handleSheetChanges}
			>
				<BottomSheetView style={styles.contentContainer}>
					<Text>Awesome 🎉</Text>
				</BottomSheetView>
			</BottomSheet>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		backgroundColor: "grey",
	},
	contentContainer: {
		flex: 1,
		alignItems: "center",
	},
});

export default App;
```


---
# components/bottomsheetflashlist.md

---
id: bottomsheetflashlist
title: BottomSheetFlashList
sidebar_label: ⭐️ FlashList
description: a pre-integrated React Native FlashList with BottomSheet gestures.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetflashlist
---

A pre-integrated [**FlashList**](https://shopify.github.io/flash-list/) component with `BottomSheet` gestures.

## Props

Inherits `FlashListProps` from [FlashList](https://shopify.github.io/flash-list/docs/usage).

### focusHook

This needed when bottom sheet used with multiple scrollables to allow bottom sheet detect the current scrollable ref, especially when used with React Navigation. You will need to provide `useFocusEffect` from `@react-navigation/native`.

| type     | default           | required |
| -------- | ----------------- | -------- |
| function | `React.useEffect` | NO       |


## Example

```tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetFlashList } from "@gorhom/bottom-sheet";


const keyExtractor = (item) => item;

const App = () => {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // callbacks
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  const renderItem = useCallback(({ item }) => {
    return (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    );
  }, []);
  return (
    <GestureHandlerRootView style={styles.container}>
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
      >
        <BottomSheetFlashList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={43.3}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default App;
```


---
# components/bottomsheetflatlist.md

---
id: bottomsheetflatlist
title: BottomSheetFlatList
sidebar_label: FlatList
description: a pre-integrated React Native FlatList with BottomSheet gestures.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetflatlist
---

A pre-integrated `React Native` FlatList with `BottomSheet` gestures.

## Props

Inherits `FlatListProps` from `react-native`.

### focusHook

This needed when bottom sheet used with multiple scrollables to allow bottom sheet detect the current scrollable ref, especially when used with React Navigation. You will need to provide `useFocusEffect` from `@react-navigation/native`.

| type     | default           | required |
| -------- | ----------------- | -------- |
| function | `React.useEffect` | NO       |

## Ignored Props

These props will be ignored if they were passed, because of the internal integration that uses them.

- `scrollEventThrottle`
- `decelerationRate`
- `onScrollBeginDrag`

## Example

```tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";

const App = () => {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetFlatList
          data={data}
          keyExtractor={(i) => i}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default App;
```


---
# components/bottomsheetfooter.md

---
id: bottomsheetfooter
title: BottomSheetFooter
sidebar_label: Footer
description: an interactive footer component for the BottomSheet.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetfooter
---

A pre-built component that sticks to the bottom of the BottomSheet and can be modify to fit your own custom interaction.

## Props

### animatedFooterPosition

Calculated footer animated position.

| type                          | default | required |
| ----------------------------- | ------- | -------- |
| Animated.SharedValue\<number> | 0       | NO       |

### bottomInset

Bottom inset to be added below the footer.

| type   | default | required |
| ------ | ------- | -------- |
| number | 0       | NO       |

### children

Component to be placed in the footer.

| type                     | default   | required |
| ------------------------ | --------- | -------- |
| ReactNode \| ReactNode[] | undefined | NO       |

## Example

```tsx
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetFooter } from '@gorhom/bottom-sheet';

const App = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // renders
  const renderFooter = useCallback(
    props => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Footer</Text>
        </View>
      </BottomSheetFooter>
    ),
    []
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        footerComponent={renderFooter}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  footerContainer: {
    padding: 12,
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#80f',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
});

export default App;
```


---
# components/bottomsheetscrollview.md

---
id: bottomsheetscrollview
title: BottomSheetScrollView
sidebar_label: ScrollView
description: a pre-integrated React Native ScrollView with BottomSheet gestures.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetscrollview
---

A pre-integrated `React Native` ScrollView with `BottomSheet` gestures.

## Props

Inherits `ScrollViewProps` from `react-native`.

### focusHook

This needed when bottom sheet used with multiple scrollables to allow bottom sheet detect the current scrollable ref, especially when used with React Navigation. You will need to provide `useFocusEffect` from `@react-navigation/native`.

| type     | default           | required |
| -------- | ----------------- | -------- |
| function | `React.useEffect` | NO       |

## Ignored Props

These props will be ignored if they were passed, because of the internal integration that uses them.

- `scrollEventThrottle`
- `decelerationRate`
- `onScrollBeginDrag`

## Example

```tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

const App = () => {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  const renderItem = useCallback(
    (item) => (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {data.map(renderItem)}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default App;
```


---
# components/bottomsheetsectionlist.md

---
id: bottomsheetsectionlist
title: BottomSheetSectionList
sidebar_label: SectionList
description: a pre-integrated React Native SectionList with BottomSheet gestures.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetsectionlist
---

A pre-integrated `React Native` SectionList with `BottomSheet` gestures.

## Props

Inherits `SectionListProps` from `react-native`.

### focusHook

This needed when bottom sheet used with multiple scrollables to allow bottom sheet detect the current scrollable ref, especially when used with React Navigation. You will need to provide `useFocusEffect` from `@react-navigation/native`.

| type     | default           | required |
| -------- | ----------------- | -------- |
| function | `React.useEffect` | NO       |

## Ignored Props

These props will be ignored if they were passed, because of the internal integration that uses them.

- `scrollEventThrottle`
- `decelerationRate`
- `onScrollBeginDrag`

## Example

```tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetSectionList } from "@gorhom/bottom-sheet";

const App = () => {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const sections = useMemo(
    () =>
      Array(10)
        .fill(0)
        .map((_, index) => ({
          title: `Section ${index}`,
          data: Array(10)
            .fill(0)
            .map((_, index) => `Item ${index}`),
        })),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.sectionHeaderContainer}>
        <Text>{section.title}</Text>
      </View>
    ),
    []
  );
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetSectionList
          sections={sections}
          keyExtractor={(i) => i}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  sectionHeaderContainer: {
    backgroundColor: "white",
    padding: 6,
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default App;
```


---
# components/bottomsheettextinput.md

---
id: bottomsheettextinput
title: BottomSheetTextInput
sidebar_label: TextInput
description: an pre-integrated TextInput component for better keyboard handling.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheettextinput
---

A pre-integrated `TextInput` that communicate with internal functionalities to allow Keyboard handling to work.

## Props

Inherits `TextInputProps` from `react-native`.

## Example

```tsx
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';

const App = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        enableDynamicSizing={false}
        onChange={handleSheetChanges}
      >
        <BottomSheetTextInput style={styles.input} />
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  input: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
});

export default App;
```


---
# components/bottomsheetview.md

---
id: bottomsheetview
title: BottomSheetView
sidebar_label: View
description: a pre-integrated React Native View with BottomSheet gestures.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetview
---

A pre-integrated `React Native` View with `BottomSheet` gestures.

## Props

Inherits `ViewProps` from `react-native`.

### focusHook

This needed when bottom sheet used with multiple scrollables to allow bottom sheet detect the current scrollable ref, especially when used with React Navigation. You will need to provide `useFocusEffect` from `@react-navigation/native`.

| type     | default           | required |
| -------- | ----------------- | -------- |
| function | `React.useEffect` | NO       |

## Example

```tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const App = () => {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  return (
    <GestureHandlerRootView style={styles.container}>
      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🔥</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});

export default App;
```


---
# components/bottomsheetvirtualizedlist.md

---
id: bottomsheetvirtualizedlist
title: BottomSheetVirtualizedList
sidebar_label: VirtualizedList
description: a pre-integrated React Native VirtualizedList with BottomSheet gestures.
image: /img/bottom-sheet-preview.gif
slug: /components/bottomsheetvirtualizedlist
---

A pre-integrated `React Native` VirtualizedList with `BottomSheet` gestures.

## Props

Inherits `VirtualizedListProps` from `react-native`.

### focusHook

This needed when bottom sheet used with multiple scrollables to allow bottom sheet detect the current scrollable ref, especially when used with React Navigation. You will need to provide `useFocusEffect` from `@react-navigation/native`.

| type     | default           | required |
| -------- | ----------------- | -------- |
| function | `React.useEffect` | NO       |

## Ignored Props

These props will be ignored if they were passed, because of the internal integration that uses them.

- `scrollEventThrottle`
- `decelerationRate`
- `onScrollBeginDrag`

## Example

```tsx
import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetVirtualizedList } from "@gorhom/bottom-sheet";

const App = () => {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetVirtualizedList
          data={data}
          keyExtractor={(i) => i}
          getItemCount={(data) => data.length}
          getItem={(data, index) => data[index]}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default App;
```


---
# guides/adding-shadow.mdx

---
id: adding-shadow
title: Adding Shadow
description: Adding shadow to the Bottom Sheet.
image: /img/bottom-sheet-preview.gif
slug: /adding-shadow
hide_table_of_contents: true
---

![React Native Bottom Sheet Shadow](/img/bottom-sheet-shadow.jpg)

To add shadow to the bottom sheet, you will need to pass the `style` prop with shadow styling config, I recommend checking out [React Native Shadow Generator](https://ethercreative.github.io/react-native-shadow-generator/) by [@ethercreative](https://github.com/ethercreative).

:::note NOTICE

You may notice that shadow looks different between **iOS** and **Android**, that's because each platform handle drawing shadows differently, read more about [Android Shadows](https://developer.android.com/training/material/shadows-clipping).

:::


---
# guides/custom-backdrop.mdx

---
id: custom-backdrop
title: Custom Backdrop
description: Bottom Sheet custom backdrop.
image: /img/bottom-sheet-preview.gif
slug: /custom-backdrop
hide_table_of_contents: true
---

To add a backdrop to your sheet you will need to pass the prop `backdropComponent` to the `BottomSheet` component.

When you provide your own backdrop component, it will receive these animated props `animatedIndex` & `animatedPosition` that indicates the position and the index of the sheet.

You can extend your custom backdrop props interface with the provided `BottomSheetBackdropProps` interface to expose `animatedIndex` & `animatedPosition` into your own interface.

### Example

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Custom Backdrop"
  url={useBaseUrl("video/bottom-sheet-custom-backdrop-preview.mp4")}
/>

Here is an example of a custom backdrop component:

```tsx
import React, { useMemo } from "react";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: "#a8b5eb",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle]
  );

  return <Animated.View style={containerStyle} />;
};

export default CustomBackdrop;
```


---
# guides/custom-background.mdx

---
id: custom-background
title: Custom Background
description: Bottom Sheet custom background.
image: /img/bottom-sheet-preview.gif
slug: /custom-background
hide_table_of_contents: true
---

To override the default background, you will need to pass the prop `backgroundComponent` to the `BottomSheet` component.

When you provide your own background component, it will receive these animated props `animatedIndex` & `animatedPosition` that indicates the position and the index of the sheet.

You can extend your custom background props interface with the provided `BottomSheetBackgroundProps` interface to expose `animatedIndex` & `animatedPosition` into your own interface.

### Example

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Custom Background"
  url={useBaseUrl("video/bottom-sheet-custom-background-preview.mp4")}
/>

Here is an example of a custom background component:

```tsx
import React, { useMemo } from "react";
import { BottomSheetBackgroundProps } from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from "react-native-reanimated";

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({
  style,
  animatedIndex,
}) => {
  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    // @ts-ignore
    backgroundColor: interpolateColor(
      animatedIndex.value,
      [0, 1],
      ["#ffffff", "#a8b5eb"]
    ),
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );
  //#endregion

  // render
  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomBackground;
```


---
# guides/custom-footer.mdx

---
id: custom-footer
title: Custom Footer
description: Bottom Sheet custom footer.
image: /img/bottom-sheet-preview.gif
slug: /custom-footer
hide_table_of_contents: true
---

To create a custom footer, you will need to use the pre-built component [BottomSheetFooter](./components/bottomsheetfooter) to wrap your footer component, the `BottomSheetFooter` will help in positioning your component at the bottom of the `BottomSheet` and will react to `Keyboard` appearance too.

When you provide your own footer component, it will receive this animated prop `animatedFooterPosition`, which is a calculated animated position for the footer.

You can extend your custom footer props interface with the provided `BottomSheetFooterProps` interface to expose `animatedFooterPosition` into your own interface.

### Example

import useBaseUrl from '@docusaurus/useBaseUrl';
import Video from '@theme/Video';

<Video
  title="React Native Bottom Sheet Custom Footer"
  url={useBaseUrl('video/bottom-sheet-footer-preview.mp4')}
/>

Here is an example of a custom footer component but first you will need to install `Redash`:

> [Redash](https://github.com/wcandillon/react-native-redash): The React Native Reanimated and Gesture Handler Toolbelt.

```tsx title="CustomFooter.tsx"
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  useBottomSheet,
} from '@gorhom/bottom-sheet';
import { RectButton } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { toRad } from 'react-native-redash';

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

// inherent the `BottomSheetFooterProps` to be able receive
// `animatedFooterPosition`.
interface CustomFooterProps extends BottomSheetFooterProps {}

const CustomFooter = ({ animatedFooterPosition }: CustomFooterProps) => {
  //#region hooks
  // we need the bottom safe insets to avoid bottom notches.
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  // extract animated index and other functionalities
  const { expand, collapse, animatedIndex } = useBottomSheet();
  //#endregion

  //#region styles
  // create the arrow animated style reacting to the
  // sheet index.
  const arrowAnimatedStyle = useAnimatedStyle(() => {
    const arrowRotate = interpolate(
      animatedIndex.value,
      [0, 1],
      [toRad(0), toRad(-180)],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotate: `${arrowRotate}rad` }],
    };
  }, []);
  const arrowStyle = useMemo(
    () => [arrowAnimatedStyle, styles.arrow],
    [arrowAnimatedStyle]
  );
  // create the content animated style reacting to the
  // sheet index.
  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        animatedIndex.value,
        [-0.85, 0],
        [0, 1],
        Extrapolate.CLAMP
      ),
    }),
    [animatedIndex]
  );
  const containerStyle = useMemo(
    () => [containerAnimatedStyle, styles.container],
    [containerAnimatedStyle]
  );
  //#endregion

  //#region callbacks
  const handleArrowPress = useCallback(() => {
    // if sheet is collapsed, then we extend it,
    // or the opposite.
    if (animatedIndex.value === 0) {
      expand();
    } else {
      collapse();
    }
  }, [expand, collapse, animatedIndex]);
  //#endregion

  return (
    <BottomSheetFooter
      // we pass the bottom safe inset
      bottomInset={bottomSafeArea}
      // we pass the provided `animatedFooterPosition`
      animatedFooterPosition={animatedFooterPosition}
    >
      <AnimatedRectButton style={containerStyle} onPress={handleArrowPress}>
        <Animated.Text style={arrowStyle}>⌃</Animated.Text>
      </AnimatedRectButton>
    </BottomSheetFooter>
  );
};

// footer style
const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#80f',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8.0,

    elevation: 8,
  },
  arrow: {
    fontSize: 20,
    height: 20,
    textAlignVertical: 'center',
    fontWeight: '900',
    color: '#fff',
  },
});

export default CustomFooter;
```

```tsx title="App.tsx"
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomFooter from './CustomFooter';

const App = () => {
  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // renders
  return (
    <View style={styles.container}>
      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        footerComponent={CustomFooter}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default App;
```


---
# guides/custom-handle.mdx

---
id: custom-handle
title: Custom Handle
description: Bottom Sheet custom handle.
image: /img/bottom-sheet-preview.gif
slug: /custom-handle
hide_table_of_contents: true
---

To override the default handle, you will need to pass the prop `handleComponent` to the `BottomSheet` component.

When you provide your own handle component, it will receive these animated props `animatedIndex` & `animatedPosition` that indicates the position and the index of the sheet.

You can extend your custom handle props interface with the provided `BottomSheetHandleProps` interface to expose `animatedIndex` & `animatedPosition` into your own interface.

### Example

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Custom Handle"
  url={useBaseUrl("video/bottom-sheet-custom-handle-preview.mp4")}
/>

Here is an example of a custom handle component, but first you will need to install `Redash`:

> [Redash](https://github.com/wcandillon/react-native-redash): The React Native Reanimated and Gesture Handler Toolbelt.

```bash
yarn add react-native-redash
```

```tsx
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { toRad } from "react-native-redash";

// @ts-ignore
export const transformOrigin = ({ x, y }, ...transformations) => {
  "worklet";
  return [
    { translateX: x },
    { translateY: y },
    ...transformations,
    { translateX: x * -1 },
    { translateY: y * -1 },
  ];
};

interface HandleProps extends BottomSheetHandleProps {
  style?: StyleProp<ViewStyle>;
}

const Handle: React.FC<HandleProps> = ({ style, animatedIndex }) => {
  //#region animations
  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], Extrapolate.CLAMP)
  );
  //#endregion

  //#region styles
  const containerStyle = useMemo(() => [styles.header, style], [style]);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [1, 2],
      [20, 0],
      Extrapolate.CLAMP
    );
    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
    };
  });
  const leftIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.leftIndicator,
    }),
    []
  );
  const leftIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const leftIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(-30), 0, toRad(30)],
      Extrapolate.CLAMP
    );
    return {
      transform: transformOrigin(
        { x: 0, y: indicatorTransformOriginY.value },
        {
          rotate: `${leftIndicatorRotate}rad`,
        },
        {
          translateX: -5,
        }
      ),
    };
  });
  const rightIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.rightIndicator,
    }),
    []
  );
  const rightIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const rightIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(30), 0, toRad(-30)],
      Extrapolate.CLAMP
    );
    return {
      transform: transformOrigin(
        { x: 0, y: indicatorTransformOriginY.value },
        {
          rotate: `${rightIndicatorRotate}rad`,
        },
        {
          translateX: 5,
        }
      ),
    };
  });
  //#endregion

  // render
  return (
    <Animated.View
      style={[containerStyle, containerAnimatedStyle]}
      renderToHardwareTextureAndroid={true}
    >
      <Animated.View style={[leftIndicatorStyle, leftIndicatorAnimatedStyle]} />
      <Animated.View
        style={[rightIndicatorStyle, rightIndicatorAnimatedStyle]}
      />
    </Animated.View>
  );
};

export default Handle;

const styles = StyleSheet.create({
  header: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  indicator: {
    position: "absolute",
    width: 10,
    height: 4,
    backgroundColor: "#999",
  },
  leftIndicator: {
    borderTopStartRadius: 2,
    borderBottomStartRadius: 2,
  },
  rightIndicator: {
    borderTopEndRadius: 2,
    borderBottomEndRadius: 2,
  },
});
```


---
# guides/detach-modal.mdx

---
id: detach-modal
title: Detach Modal
description: Bottom Sheet custom footer.
image: /img/bottom-sheet-preview.gif
slug: /detach-modal
hide_table_of_contents: true
---

To create a detach modal, you will need to pass the prop `detached={true}` to the `BottomSheet` or `BottomSheetModal`, along side with `bottomInset` to push the sheet from the bottom.

### Example

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Detach Modal"
  url={useBaseUrl("video/bottom-sheet-detach-preview.mp4")}
/>

Here is an example of a simple detach modal:

```tsx
import React, { useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

const App = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%"], []);

  // renders
  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        // add bottom inset to elevate the sheet
        bottomInset={46}
        // set `detached` to true
        detached={true}
        style={styles.sheetContainer}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  sheetContainer: {
    // add horizontal space
    marginHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

export default App;
```


---
# guides/dynamic-sizing.mdx

---
id: dynamic-sizing
title: Dynamic Sizing
sidebar_label: ⭐️ Dynamic Sizing
description: Bottom Sheet dynamic sizing.
image: /img/bottom-sheet-preview.gif
slug: /dynamic-sizing
hide_table_of_contents: true
---

Dynamic Sizing is one of the powerful feature that `v5` introduces, where the library internally managed to calculate static views and list content size height and set it as the bottom sheet content height.

:::info

The mechanism was introduce previously with [useBottomSheetDynamicSnapPoints](https://gorhom.dev/react-native-bottom-sheet/v4/hooks#usebottomsheetdynamicsnappoints) hook which been deprecated with the new release.

:::

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Dynamic Sizing"
  url={useBaseUrl("video/bottom-sheet-dynamic-sizing-preview.mp4")}
/>

### Usage 

In order to enable the dynamic sizing to work properly, you would need to follow these rules:

1. Use the pre-configured [Scrollables](./scrollables) views, including the static view [BottomSheetView](./components/bottomsheetview).
2. In order to prevent the bottom sheet a exceeding certain height, you will need to set [`maxDynamicContentSize`](./props#maxdynamiccontentsize) prop.

And remember, you can always disable the feature if its not needed by overriding the prop [`enableDynamicSizing`](./props#enabledynamicsizing) with `false`.



---
# guides/keyboard-handling.mdx

---
id: keyboard-handling
title: Keyboard Handling
description: Keyboard handling with Bottom Sheet.
image: /img/bottom-sheet-preview.gif
slug: /keyboard-handling
hide_table_of_contents: true
---

Keyboard handling is one of the main feature of `BottomSheet v4`, thanks to the effort of the community to spot issues, test and help to debug the implementation on both platform `iOS` & `Android`.

To handle the keyboard appearance, I have simplified the approach by creating a pre-integrated `TextInput` called [BottomSheetTextInput](./components/bottomsheettextinput), which communicate internally to react to the keyboard appearance.

Also I have introduce two props to allow users to customize the handling, [keyboardBehavior](./props#keyboardbehavior), [keyboardBlurBehavior](./props#keyboardblurbehavior), [enableBlurKeyboardOnGesture](./props#enableblurkeyboardongesture) and [android_keyboardInputMode](./props#android_keyboardinputmode) that is only for `Android`.

:::tip
To use custom `TextInput`, you will need to copy the `handleOnFocus` and `handleOnBlur` from [BottomSheetTextInput](https://github.com/gorhom/react-native-bottom-sheet/blob/master/src/components/bottomSheetTextInput/BottomSheetTextInput.tsx) into your own component.
:::

### Example

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Keyboard Handling"
  url={useBaseUrl("video/bottom-sheet-keyboard-handling-preview.mp4")}
/>

Here is an example of a simple keyboard handling:

```tsx
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetTextInput } from "@gorhom/bottom-sheet";

const App = () => {
  // variables
  const snapPoints = useMemo(() => ["25%"], []);

  // renders
  return (
    <View style={styles.container}>
      <BottomSheet snapPoints={snapPoints}>
        <View style={styles.contentContainer}>
          <BottomSheetTextInput value="Awesome 🎉" style={styles.textInput} />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  textInput: {
    alignSelf: "stretch",
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "grey",
    color: "white",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

export default App;
```


---
# guides/pull-to-refresh.mdx

---
id: pull-to-refresh
title: Pull To Refresh
description: Pull To Refresh with Bottom Sheet.
image: /img/bottom-sheet-preview.gif
slug: /pull-to-refresh
hide_table_of_contents: true
---

Pull to refresh feature is enabled by default, and it will be activated on the top snap point provided. All you need to do is to provide `refreshing` & `onRefresh` to any of the [Scrollables](./scrollables).

:::note

Currently `refreshControl` is not supported, feel free to contribute to enable it ❤️

:::

### Example

import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Pull to Refresh"
  url={useBaseUrl("video/bottom-sheet-pull-to-refresh-preview.mp4")}
/>

Here is an example of a simple pull to refresh:

```tsx
import React, { useCallback, useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";

const App = () => {
  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // callbacks
  const handleRefresh = useCallback(() => {
    console.log("handleRefresh");
  }, []);

  // render
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  return (
    <View style={styles.container}>
      <BottomSheet snapPoints={snapPoints}>
        <BottomSheetFlatList
          data={data}
          keyExtractor={(i) => i}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainer}
          refreshing={false}
          onRefresh={handleRefresh}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default App;
```


---
# guides/react-navigation.md

---
id: react-navigation-integration
title: React Navigation Integration
description: Bottom Sheet React Navigation integration.
image: /img/bottom-sheet-preview.gif
slug: /react-navigation-integration
hide_table_of_contents: true
---

One of the main goal of this library, is to allow user to fully integrate a stack navigator in the bottom sheet. This integration allows lots of opportunities for a native-like experience in your app 😇

However, there are some tricks has to be follow to enable both libraries to work together seamlessly.

- You need to override `safeAreaInsets`, by default `React Navigation` add the safe area insets to all its navigators, but since your navigator will properly won't cover full screen, you will need to override it and set it to `0`.

For more details regarding the implementation, please have a look at the [Navigator Example](https://github.com/gorhom/react-native-bottom-sheet/blob/master/example/src/screens/integrations/navigation/NavigatorExample.tsx)
).


---
# guides/web-support.mdx

---
id: web-support
title: Web Support
sidebar_label: ⭐️ Web Support
description: Bottom Sheet web support.
image: /img/bottom-sheet-preview.gif
slug: /web-support
hide_table_of_contents: true
---

Supporting Web has been on my list since day 0 ([issue #11](https://github.com/gorhom/react-native-bottom-sheet/issues/11)), but unfortunately was not a priority until the community start adopting solutions such as [Expo Web](https://docs.expo.dev/workflow/web/), which also provided an easier development setup for me to kick off the development.

With **v5** release, users will be able to use the library in web mobile without changing the API 🪄.


import useBaseUrl from "@docusaurus/useBaseUrl";
import Video from "@theme/Video";

<Video
  title="React Native Bottom Sheet Web Support"
  url={useBaseUrl("video/bottom-sheet-web-support-preview.mp4")}
/>

### Setup 

In order to use the bottom sheet on web, you would need to follow the instructions from [Reanimated documentation](https://docs.swmansion.com/react-native-reanimated/docs/guides/web-support/).

---
# modal/hooks.md

---
id: hooks
title: Hooks
description: Bottom Sheet modal hooks.
image: /img/bottom-sheet-preview.gif
slug: /modal/hooks
---

## useBottomSheetModal

This hook provides modal functionalities only, for sheet functionalities please look at [Bottom Sheet Hooks](../hooks).

> This hook works at any component in `BottomSheetModalProvider`.

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';

const SheetContent = () => {
  const { dismiss, dismissAll } = useBottomSheetModal();

  return (
    <View>
      <Button onPress={dismiss}>
    </View>
  )
}
```

## dismiss

```ts
type dismiss = (key?: string) => void;
```

Dismiss a modal by its name/key, if key is not provided, then it will dismiss the last presented modal.

## dismissAll

```ts
type dismissAll = () => void;
```

Dismiss all mounted/presented modals.


---
# modal/index.mdx

---
id: index
title: Modal
sidebar_label: Modal
description: A performant interactive bottom sheet modal with fully configurable options 🚀
image: /img/bottom-sheet-modal-preview.gif
slug: /modal
---

# React Native Bottom Sheet Modal

import useBaseUrl from '@docusaurus/useBaseUrl';
import Video from '@theme/Video';

<Video
  title="React Native Bottom Sheet Modal"
  url={useBaseUrl('video/bottom-sheet-modal-preview.mp4')}
/>

**Bottom Sheet Modal** is wrapper/decorator on top of the **Bottom Sheet**, it provides all of its functionalities with extra modal presentation functionalities.

With the release of the library, support for stack sheet modals were something planned ahead to provide the a native feel & and experience to users.

The implementation of this feature was inspired by Apple Maps sheet modals ❤️, [check out the Apple Map sheet modals clone](https://github.com/gorhom/react-native-bottom-sheet/blob/master/example/src/screens/integrations/map/MapExample.tsx).

## Features

- ...[Bottom Sheet Features](./#features)
- Smooth interaction and mounting animation.
- Support stack sheet modals.

## Installation

This feature is already shipped with `@gorhom/bottom-sheet` package and it requires no extra dependency.


---
# modal/methods.md

---
id: methods
title: Methods
description: Bottom Sheet modal methods.
image: /img/bottom-sheet-preview.gif
slug: /modal/methods
---

**Bottom Sheet Modal** inherits all [**Bottom Sheet** methods](../methods) and also it introduces its own methods.

These methods are accessible using the bottom sheet modal reference:

```tsx
import React, { useRef } from 'react';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

const App = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentPress = () => bottomSheetModalRef.current.present()
  return (
    <>
      <Button title="Present Sheet" onPress={handlePresentPress} />
      <BottomSheetModal ref={bottomSheetModalRef}>
    </>
  )
}

```

### present

Mount and present the bottom sheet modal to the initial snap point.

```ts
type present = (
  // Data to be passed to the modal.
  data?: any
) => void;
```

### dismiss

Close and unmount the bottom sheet modal.

```ts
type dismiss = (
  // AnimationConfigs snap animation configs.
  animationConfigs?: WithSpringConfig | WithTimingConfig
) => void;
```


---
# modal/props.md

---
id: props
title: Props
description: Bottom Sheet modal configurable props.
image: /img/bottom-sheet-preview.gif
slug: /modal/props
---

**Bottom Sheet Modal** inherits all [**Bottom Sheet** props](../props) except for `animateOnMount` & `containerHeight` and also it introduces its own props:

## Configuration

### name

Modal name to help identify the modal for later on.

| type   | default                | required |
| ------ | ---------------------- | -------- |
| string | `generated unique key` | NO       |

### stackBehavior

**`Available only on v3, for now.`**

Defines the stack behavior when modal mounts.

- `push` it will mount the modal on top of the current one.
- `switch` it will minimize the current modal then mount the new one.
- `replace` it will dismiss the current modal then mount the new one.

| type                | default   | required |
| ------------------- | --------- | -------- |
| 'push' \| 'switch' \| 'replace' | 'switch' | NO       |

### enableDismissOnClose

Dismiss the modal when it is closed, this will unmount the modal.

| type    | default | required |
| ------- | ------- | -------- |
| boolean | true    | NO       |

## Callbacks

### onDismiss

Callback when the modal dismissed (unmounted).

```ts
type onDismiss = () => void;
```

| type     | default | required |
| -------- | ------- | -------- |
| function | null    | NO       |

## Components

### containerComponent

Component to be placed as a bottom sheet container, this is to place
the bottom sheet at the very top layer of your application when using `FullWindowOverlay`
from `React Native Screens`. [read more](https://github.com/gorhom/react-native-bottom-sheet/issues/832)

| type            | default   | required |
| --------------- | --------- | -------- |
| React.ReactNode | undefined | NO       |


---
# modal/usage.md

---
id: usage
title: Usage
description: Bottom Sheet modal usage.
image: /img/bottom-sheet-preview.gif
slug: /modal/usage
---

Here is a simple usage of the **Bottom Sheet Modal**, with non-scrollable content. For more scrollable usage please read [Scrollables](../scrollables).

```tsx
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const App = () => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <Button
            onPress={handlePresentModalPress}
            title="Present Modal"
            color="black"
          />
          <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
          >
            <BottomSheetView style={styles.contentContainer}>
              <Text>Awesome 🎉</Text>
            </BottomSheetView>
        </BottomSheetModal>
        </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default App;
```
