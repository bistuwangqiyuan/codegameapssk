-- ====================================
-- Level 1: HTML5 Basics - Lesson Seeds
-- ====================================
-- Get Level 1 ID (HTML5 Basics)
DO $$
DECLARE level_1_id UUID;
BEGIN
SELECT id INTO level_1_id
FROM levels
WHERE level_number = 1
LIMIT 1;
-- Lesson 1: Introduction to HTML
INSERT INTO lessons (
        id,
        level_id,
        title,
        slug,
        description,
        learning_objectives,
        instructional_content,
        code_examples,
        hints,
        estimated_duration,
        sequence_order,
        xp_reward,
        is_published
    )
VALUES (
        gen_random_uuid(),
        level_1_id,
        'Introduction to HTML',
        'intro-to-html',
        'Learn what HTML is and create your first webpage',
        ARRAY ['Understand what HTML is', 'Learn basic HTML structure', 'Create a simple HTML document'],
        '# Welcome to HTML!

HTML (HyperText Markup Language) is the foundation of every website. It defines the **structure** and **content** of web pages.

## What is HTML?

Think of HTML as the skeleton of a website. Just like your skeleton gives your body structure, HTML gives websites structure.

## Basic Structure

Every HTML document follows this basic pattern:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first webpage!</p>
  </body>
</html>
```

## Key Concepts

- **Tags**: HTML uses tags like `<html>`, `<body>`, `<p>` to mark up content
- **Elements**: A complete tag pair with content: `<h1>Hello</h1>`
- **Attributes**: Extra information in tags: `<img src="photo.jpg">`

Try creating your first HTML page!',
        '{"example1": "<!DOCTYPE html><html><body><h1>My Website</h1></body></html>"}',
        ARRAY ['Start with <!DOCTYPE html>', 'Remember to close all tags', 'The content goes inside <body>'],
        15,
        1,
        50,
        true
    );
-- Lesson 2: HTML Tags and Elements
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
        level_1_id,
        'HTML Tags and Elements',
        'html-tags',
        'Master common HTML tags and how to use them',
        ARRAY ['Use heading tags (h1-h6)', 'Create paragraphs and line breaks', 'Format text with emphasis'],
        '# HTML Tags

HTML has many built-in tags for different types of content.

## Headings

Use `<h1>` through `<h6>` for headings:

```html
<h1>Main Heading</h1>
<h2>Subheading</h2>
<h3>Smaller Heading</h3>
```

## Text Formatting

- `<p>` - Paragraph
- `<strong>` - Bold (important)
- `<em>` - Italic (emphasis)
- `<br>` - Line break

```html
<p>This is a <strong>bold</strong> and <em>italic</em> text.</p>
```',
        20,
        2,
        75,
        true
    );
-- Lesson 3: Lists in HTML
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
        level_1_id,
        'Creating Lists',
        'html-lists',
        'Learn to create ordered and unordered lists',
        ARRAY ['Create bullet point lists', 'Create numbered lists', 'Nest lists inside lists'],
        '# HTML Lists

Lists help organize information on your page.

## Unordered Lists (Bullets)

```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Orange</li>
</ul>
```

## Ordered Lists (Numbers)

```html
<ol>
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>
```

## Nested Lists

You can put lists inside lists!

```html
<ul>
  <li>Fruits
    <ul>
      <li>Apple</li>
      <li>Banana</li>
    </ul>
  </li>
  <li>Vegetables</li>
</ul>
```',
        15,
        3,
        75,
        true
    );
-- Lesson 4: Links and Navigation
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
        level_1_id,
        'Links and Navigation',
        'html-links',
        'Connect pages together with hyperlinks',
        ARRAY ['Create links to other pages', 'Understand absolute vs relative URLs', 'Open links in new tabs'],
        '# Hyperlinks

Links connect the web together!

## Basic Link

```html
<a href="https://example.com">Visit Example</a>
```

## Link Types

**External link:**
```html
<a href="https://google.com">Google</a>
```

**Internal link:**
```html
<a href="about.html">About Us</a>
```

**Open in new tab:**
```html
<a href="https://example.com" target="_blank">Open in New Tab</a>
```

## Email Links

```html
<a href="mailto:hello@example.com">Email Us</a>
```',
        20,
        4,
        100,
        true
    );
-- Lesson 5: Images
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
        level_1_id,
        'Adding Images',
        'html-images',
        'Display images on your webpage',
        ARRAY ['Add images with img tag', 'Use alt text for accessibility', 'Control image size'],
        '# Images in HTML

Make your pages visual with images!

## Basic Image

```html
<img src="photo.jpg" alt="Description of image">
```

## Important Attributes

- **src**: Path to the image file
- **alt**: Description for screen readers and if image fails
- **width/height**: Control size

```html
<img src="logo.png" alt="Company Logo" width="200" height="100">
```

## Image Best Practices

1. Always include alt text
2. Use appropriate file formats (JPG, PNG, WebP)
3. Optimize image sizes for web
4. Use descriptive filenames',
        20,
        5,
        100,
        true
    );
-- Lesson 6: Semantic HTML
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
        level_1_id,
        'Semantic HTML',
        'semantic-html',
        'Use meaningful HTML tags for better structure',
        ARRAY ['Understand semantic HTML', 'Use header, nav, main, footer', 'Improve accessibility'],
        '# Semantic HTML

Use tags that describe their content!

## Why Semantic HTML?

- Better for SEO
- Improves accessibility
- Easier to read and maintain

## Common Semantic Tags

```html
<header>
  <nav>Navigation links</nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content...</p>
  </article>
  
  <aside>
    Sidebar content
  </aside>
</main>

<footer>
  Copyright © 2025
</footer>
```

## Other Semantic Tags

- `<section>` - Thematic grouping
- `<article>` - Self-contained content
- `<aside>` - Sidebar content
- `<figure>` - Images with captions',
        25,
        6,
        125,
        true
    );
-- Lesson 7: Forms Basics
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
        level_1_id,
        'HTML Forms',
        'html-forms',
        'Create interactive forms for user input',
        ARRAY ['Create input fields', 'Add buttons', 'Understand form structure'],
        '# HTML Forms

Collect user input with forms!

## Basic Form

```html
<form>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name">
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email">
  
  <button type="submit">Submit</button>
</form>
```

## Input Types

- `text` - Single line text
- `email` - Email address
- `password` - Hidden text
- `number` - Numeric input
- `checkbox` - Checkboxes
- `radio` - Radio buttons

## Example

```html
<form>
  <input type="checkbox" id="agree" name="agree">
  <label for="agree">I agree</label>
  
  <button>Submit</button>
</form>
```',
        25,
        7,
        125,
        true
    );
-- Lesson 8: Tables
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
        level_1_id,
        'HTML Tables',
        'html-tables',
        'Organize data in rows and columns',
        ARRAY ['Create table structure', 'Add headers and data', 'Format tables'],
        '# HTML Tables

Display data in a grid!

## Basic Table

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John</td>
      <td>25</td>
    </tr>
    <tr>
      <td>Jane</td>
      <td>30</td>
    </tr>
  </tbody>
</table>
```

## Table Tags

- `<table>` - Container
- `<thead>` - Header section
- `<tbody>` - Body section
- `<tr>` - Table row
- `<th>` - Header cell
- `<td>` - Data cell',
        20,
        8,
        100,
        true
    );
-- Lesson 9: HTML5 Media
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
        level_1_id,
        'Audio and Video',
        'html5-media',
        'Embed audio and video in your pages',
        ARRAY ['Add video elements', 'Add audio elements', 'Use media controls'],
        '# HTML5 Media

Embed multimedia content!

## Video

```html
<video controls width="640" height="360">
  <source src="video.mp4" type="video/mp4">
  Your browser doesn''t support video.
</video>
```

## Audio

```html
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  Your browser doesn''t support audio.
</audio>
```

## Attributes

- `controls` - Show play/pause buttons
- `autoplay` - Auto-start (use carefully!)
- `loop` - Repeat forever
- `muted` - Start muted',
        20,
        9,
        125,
        true
    );
-- Lesson 10: Meta Tags and SEO
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
        level_1_id,
        'Meta Tags and SEO',
        'html-meta-seo',
        'Optimize your pages for search engines',
        ARRAY ['Add meta tags', 'Understand SEO basics', 'Set viewport for mobile'],
        '# Meta Tags

Improve your site''s visibility!

## Essential Meta Tags

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Page description">
  <meta name="keywords" content="html, web, tutorial">
  <title>Page Title - Important for SEO!</title>
</head>
```

## Social Media Tags

```html
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="image.jpg">
```

## Best Practices

1. Unique title for each page
2. Descriptive meta descriptions
3. Always set viewport for mobile
4. Use semantic HTML for better SEO',
        25,
        10,
        150,
        true
    );
RAISE NOTICE 'Level 1 (HTML5 Basics) - 10 lessons seeded successfully!';
END $$;