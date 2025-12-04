# Angel Hair - Custom Shopify Theme

A luxury hair care brand theme built specifically for Angel Hair. This custom theme features elegant design, smooth animations, and full Meta Pixel integration for optimal ad performance.

## Features

- 🎨 **Luxury Design** - Elegant gold & cream color scheme with premium typography
- 📱 **Mobile-First** - Fully responsive design optimized for all devices
- 🛒 **E-commerce Ready** - Product pages, collections, cart, and checkout
- 📊 **Meta Pixel Integration** - Full tracking for Facebook/Instagram Ads
- 💬 **WhatsApp Button** - Floating contact button with animations
- ✨ **Smooth Animations** - Scroll reveals, hover effects, and page transitions
- 🌐 **Multi-Language** - English & Spanish locale files included
- ⚡ **Performance Optimized** - Lazy loading, minimal CSS/JS

## Installation

### Method 1: Upload Theme ZIP

1. Go to your Shopify Admin → **Online Store** → **Themes**
2. Click **Add theme** → **Upload zip file**
3. Select the `angel-hair-theme.zip` file
4. Click **Customize** to configure your theme

### Method 2: Connect via GitHub (Recommended)

1. Push this theme folder to a GitHub repository
2. In Shopify Admin, go to **Online Store** → **Themes**
3. Click **Add theme** → **Connect from GitHub**
4. Select your repository and branch

## Configuration

### Theme Settings

Access theme settings via **Customize** → **Theme Settings**:

#### Colors
- **Primary Color**: Main brand gold (#C9A962)
- **Secondary Color**: Dark text (#2C2C2C)
- **Accent Color**: Light gold (#E8D5A3)
- **Background**: Off-white (#FEFEFE)

#### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body**: Lato (clean sans-serif)

#### Logo
- Upload your logo image
- Recommended: PNG with transparency, 300px width

#### Social Media
- Instagram URL
- TikTok URL
- Facebook URL

#### WhatsApp
- Enable/disable floating button
- Phone number (with country code)
- Default message
- Tooltip text

#### Meta Pixel
- Enter your Facebook Pixel ID for automatic tracking

### Pages to Create

For the theme to work properly, create these pages in Shopify:

1. **About Us** (handle: `about`)
   - Assign template: `page.about`
   
2. **Contact** (handle: `contact`)
   - Assign template: `page.contact`
   
3. **FAQ** (handle: `faq`)
   - Assign template: `page.faq`

### Navigation

Set up your menus in **Online Store** → **Navigation**:

**Main Menu:**
- Home
- Shop (link to collections)
- About Us
- Contact
- FAQ

**Footer Menu:**
- About Us
- Contact
- FAQ
- Privacy Policy
- Terms of Service

## Meta Pixel Events

The theme automatically tracks these events:

| Event | Trigger | Data Sent |
|-------|---------|-----------|
| PageView | Every page load | - |
| ViewContent | Product page | Product ID, name, price |
| AddToCart | Add to cart button | Product ID, price |
| InitiateCheckout | Checkout button | Cart contents, total |
| Contact | WhatsApp click | Contact method |
| Lead | Contact form submit | Form type |

## Customizing Sections

### Homepage

Use the theme customizer to arrange sections:
- **Announcement Bar** - Top banner for promotions
- **Hero Banner** - Full-width hero with CTA
- **Featured Products** - Product grid
- **Product Carousel** - Sliding product showcase
- **FAQ Accordion** - Common questions
- **Contact Form** - Get in touch

### Product Page

Customize product pages with:
- Large product images with zoom
- Variant selector
- Add to cart with quantity
- Related products carousel

## File Structure

```
angel-hair-theme/
├── assets/              # CSS, JS, images
├── config/              # Theme settings
├── layout/              # Main theme layout
├── locales/             # Language files (EN, ES)
├── sections/            # Page sections
├── snippets/            # Reusable components
└── templates/           # Page templates
```

## Performance Tips

1. **Optimize Images**: Use Shopify's image CDN with appropriate sizes
2. **Lazy Loading**: Images outside viewport load lazily
3. **Minimal JavaScript**: Theme uses vanilla JS, no heavy frameworks
4. **CSS Variables**: Easy customization without code changes

## Support

For questions or customization requests, contact:
- Email: [your-email]
- WhatsApp: [your-number]

## Version History

### v1.0.0 (Initial Release)
- Full theme launch
- All core pages and sections
- Meta Pixel integration
- Multi-language support

---

Built with ❤️ for Angel Hair

