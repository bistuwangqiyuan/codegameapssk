-- ====================================
-- Level 2: CSS Styling - Lesson Seeds
-- ====================================
-- Get Level 2 ID (CSS Styling)
DO $$
DECLARE level_2_id UUID;
BEGIN
SELECT id INTO level_2_id
FROM levels
WHERE level_number = 2
LIMIT 1;
-- Lesson 1: Introduction to CSS
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_2_id,
        'Introduction to CSS',
        'intro-to-css',
        'Learn what CSS is and how to style your HTML',
        ARRAY ['Understand what CSS is', 'Add CSS to HTML', 'Write basic CSS rules'],
        '# Welcome to CSS!

CSS (Cascading Style Sheets) makes your websites beautiful!

## What is CSS?

If HTML is the skeleton, CSS is the **skin, clothes, and makeup**. It controls:
- Colors
- Fonts
- Layouts
- Animations

## Three Ways to Add CSS

**1. Inline** (not recommended):
```html
<p style="color: red;">Red text</p>
```

**2. Internal** (in `<head>`):
```html
<style>
  p { color: blue; }
</style>
```

**3. External** (best practice):
```html
<link rel="stylesheet" href="style.css">
```

## Basic CSS Syntax

```css
selector {
  property: value;
}

h1 {
  color: blue;
  font-size: 32px;
}
```',
        20,
        1,
        75,
        true
    );
-- Lesson 2: CSS Selectors
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_2_id,
        'CSS Selectors',
        'css-selectors',
        'Target elements with CSS selectors',
        ARRAY ['Use element selectors', 'Use class and ID selectors', 'Combine selectors'],
        '# CSS Selectors

Target exactly what you want to style!

## Element Selector

```css
p {
  color: black;
}
```

## Class Selector

```html
<p class="highlight">Text</p>
```
```css
.highlight {
  background: yellow;
}
```

## ID Selector

```html
<div id="header">Header</div>
```
```css
#header {
  font-size: 24px;
}
```

## Combining Selectors

```css
/* Elements with class */
p.highlight { color: red; }

/* Descendant */
div p { margin: 10px; }

/* Multiple selectors */
h1, h2, h3 { font-family: Arial; }
```',
        25,
        2,
        100,
        true
    );
-- Lesson 3: Colors and Backgrounds
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_2_id,
        'Colors and Backgrounds',
        'css-colors',
        'Add colors and backgrounds to your elements',
        ARRAY ['Use different color formats', 'Set background colors', 'Add background images'],
        '# Colors in CSS

Make it colorful!

## Color Formats

```css
/* Named colors */
color: red;

/* Hex codes */
color: #FF0000;

/* RGB */
color: rgb(255, 0, 0);

/* RGBA (with transparency) */
color: rgba(255, 0, 0, 0.5);

/* HSL */
color: hsl(0, 100%, 50%);
```

## Backgrounds

```css
/* Background color */
background-color: #f0f0f0;

/* Background image */
background-image: url(''pattern.png'');
background-repeat: no-repeat;
background-position: center;
background-size: cover;

/* Shorthand */
background: #fff url(''bg.jpg'') no-repeat center/cover;
```

## Gradients

```css
background: linear-gradient(to right, red, yellow);
background: radial-gradient(circle, blue, green);
```',
        25,
        3,
        100,
        true
    );
-- Lesson 4: Typography
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_2_id,
        'Typography',
        'css-typography',
        'Style text with fonts, sizes, and spacing',
        ARRAY ['Set fonts and sizes', 'Adjust text alignment', 'Control line height and spacing'],
        '# Typography in CSS

Make text readable and beautiful!

## Font Properties

```css
font-family: Arial, sans-serif;
font-size: 16px;
font-weight: bold; /* or 700 */
font-style: italic;
line-height: 1.5;
```

## Text Styling

```css
color: #333;
text-align: center; /* left, right, justify */
text-decoration: underline;
text-transform: uppercase;
letter-spacing: 2px;
```

## Web Fonts

```css
@import url(''https://fonts.googleapis.com/css2?family=Roboto'');

body {
  font-family: ''Roboto'', sans-serif;
}
```

## Font Size Units

- `px` - Fixed pixels
- `em` - Relative to parent
- `rem` - Relative to root
- `%` - Percentage',
        25,
        4,
        100,
        true
    );
-- Lesson 5: Box Model
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_2_id,
        'CSS Box Model',
        'css-box-model',
        'Understand padding, borders, and margins',
        ARRAY ['Master the box model', 'Use padding and margin', 'Add borders'],
        '# The CSS Box Model

Every element is a box!

## Box Model Components

```
+---------------------------+
|        Margin            |
|  +---------------------+ |
|  |     Border          | |
|  |  +---------------+  | |
|  |  |   Padding     |  | |
|  |  |  +---------+  |  | |
|  |  |  | Content |  |  | |
|  |  |  +---------+  |  | |
|  |  +---------------+  | |
|  +---------------------+ |
+---------------------------+
```

## Properties

```css
/* Individual sides */
margin-top: 10px;
margin-right: 20px;
margin-bottom: 10px;
margin-left: 20px;

/* Shorthand */
margin: 10px 20px; /* top/bottom left/right */
padding: 10px 20px 10px 20px; /* top right bottom left */

/* Border */
border: 2px solid black;
border-radius: 10px;
```

## Box Sizing

```css
/* Better box model */
box-sizing: border-box;
```',
        30,
        5,
        125,
        true
    );
-- Continue with 7 more CSS lessons...
-- Lesson 6: Layouts (Flexbox basics)
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_2_id,
        'Flexbox Layout',
        'css-flexbox',
        'Create flexible layouts with Flexbox',
        ARRAY ['Use display: flex', 'Align items', 'Create responsive layouts'],
        '# Flexbox Layout

Modern, flexible layouts!

## Basic Flexbox

```css
.container {
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center; /* vertical */
  gap: 20px;
}
```

## Flex Direction

```css
flex-direction: row; /* default */
flex-direction: column;
flex-direction: row-reverse;
```

## Flex Items

```css
.item {
  flex: 1; /* grow to fill space */
  flex-shrink: 0; /* don''t shrink */
  flex-basis: 200px; /* starting size */
}
```',
        35,
        6,
        150,
        true
    );
RAISE NOTICE 'Level 2 (CSS Styling) - 6 lessons seeded (more can be added)';
END $$;