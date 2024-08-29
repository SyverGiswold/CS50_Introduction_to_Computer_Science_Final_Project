# Color Palette Generator

#### Video Demo: <URL HERE>

## Description:

For my CS50 final project, I wanted to build something that I knew I'd find useful as I'm learning web development – a color palette generator. Picking good color schemes can be tricky, so I figured I'd make a tool that takes the guesswork out of it. It's pretty simple, you give it a color using either a color picker or writing a hex code, and it generates eleven shades, from light to dark. This gives you a solid foundation for designing a website with consistent and visually appealing colors.

But it's not just about making pretty palettes. The generator also calculates and shows you the contrast ratio of each shade against the lightest and darkest ones. This is super important for accessibility because people with visual impairments need enough contrast between text and background to be able to read the content. The generator even smartly changes the text color on each shade's box to make sure it's as readable as possible, giving you a visual cue about whether your colors meet accessibility guidelines.

To take it a step further, I added some examples of how the palette can be used in real UI components like buttons, inputs, and toggles. This gives you a better idea of how your colors will look in a real design and hopefully sparks some creative ideas.

And because being able to share a color palette easily is important, there's a handy URL sharing feature. You could just copy the URL from your browser's search bar since it updates when you input new colors, or you could press the share button that copies the URL to your clipboard.

## Features:

- **Color Input:** Pick a color using the browser's color picker or type in a hex code.
- **Palette Generation:** Get eleven shades automatically, from light to dark, based on your chosen color.
- **Color Display:** Each shade is displayed in a box that updates instantly when you change the input color.
- **Contrast Ratio Calculation:** See the contrast ratio for each shade and get a visual check of accessibility by the text color adjusting for optimal readability.
- **UI Component Examples:** See how your palette looks on buttons, inputs, and toggles to get a feel for its potential in a real design.
- **URL Sharing:** Easily share your palette with others using a unique link.

## How It Works:

So, here's how this color palette generator actually works under the hood:

First off, when you input a color (either with the color picker or by typing a hex code), the app takes that hex code and converts it to HSL (Hue, Saturation, Lightness) values. This conversion happens in the `convertHexToHSL` function. We use HSL because it's easier to create variations of a color by adjusting the lightness while keeping the hue and saturation the same.

The `generatePalette` function is where the magic happens. It creates 11 shades of the color you picked. It does this by keeping the hue and saturation the same, but changing the lightness. The function creates a range of lightness values, with the original color somewhere in the middle. Then it adjusts these values to make sure they're spread out nicely and include your original color.

After generating these colors in HSL, the function converts them back to hex codes using the `convertHSLToHex` function. This is because hex codes are more commonly used in web development.

Now, for the accessibility part, we use the `calculateContrastRatio` function. This function first converts the hex codes to RGB values using `hexToRgb`, then calculates the relative luminance of each color with `calculateRelativeLuminance`. The contrast ratio is then computed using these luminance values. This follows the WCAG (Web Content Accessibility Guidelines) formula for calculating contrast ratios.

When displaying each color in the palette, the app compares its contrast ratio with both the lightest and darkest colors in the palette. It then chooses whichever gives a better contrast for the text color. This is why you see the text color changing as you go from light to dark shades.

The URL sharing feature works by updating the URL's hash (the part after the #) whenever you change the color. The `updateURL` function handles this. When you load the page, it checks if there's a color in the URL hash and uses that if it's there.

Lastly, all the UI components (buttons, inputs, toggles) are styled using CSS variables. These variables are updated dynamically when you change the color, which is why you see everything update in real-time.

## Design Choices:

I went with the HSL (Hue, Saturation, Lightness) color space for generating the shades because it's more intuitive and predictable than RGB. By tweaking the lightness while keeping the hue and saturation the same, you get a palette with a natural flow of shades that just look good together.

Accessibility was a big focus, so I made sure to highlight contrast ratios and dynamically adjust text color for the best readability. This nudges users to think about inclusivity right from the start of the design process.

The UI component examples are there to show how the palette can actually be used in a real design. It's one thing to see a bunch of colors, but it's way more helpful to see how they might look on actual website elements.

## Challenges Encountered:

Building this wasn't always easy. I ran into some tricky bugs along the way. One headache was making sure the generated shades were always valid hex codes. Sometimes, the algorithm would spit out values that were out of bounds, messing up the colors.

Another weird bug popped up when the user picked a base color with zero saturation – for some reason, the palette would turn into a single color! And there was this other random bug where if the saturation was exactly 82%, the program would freak out and give me some crazy invalid color values.

These issues are all fixed now, but figuring them out was a real pain! It taught me a lot about how color spaces work and how important it is to test your code thoroughly. Hopefully there are not any more issues like this that I have somehow not found.

This might not be a challenge per se, but for some reason when I tested to see if the math for the contrast was correct I got a slightly different value than dev tools in Chrome gave me. Not anything major. The contrast might be off by 0.01 so I am guessing it's just a rounding issue, but when it's so minor it's fairly inconsequential. Although using dev tools in Firefox gave me the exact same values as my website returns.

## Limitations:

Right now, the generator always creates eleven shades. While the `generatePalette` function can technically make more or fewer shades (it has a `numColors` parameter that is set to 11), I kept it fixed for simplicity. Following the typical "50" to "950" naming convention usually covers most design needs, but I could add a way to customize this in the future.

## Future Improvements:

There are a few things I could add to make the generator even better. Letting users choose how many shades they want would be cool, giving them more control over the palette. This would make me have to rewrite a lot of the code again because for instance the colors generated all get returned as variables from "50" to "950". Since these variables are hard coded the components also reference these variables and if you generate only six colors you would lose several colors completely causing parts of the components to be invisible.

Also, adding options for exporting the palette in different formats (like CSS variables, JSON, or even an image) would make it easier to use the colors in other projects.

That's pretty much the technical gist of how it all works!