# Harsh Raj — Academic Portfolio & Research Simulator

This repository contains the source code for the professional academic portfolio, interactive simulator, and Curriculum Vitae (CV) of **Harsh Raj**, a Ph.D. Research Scholar in the Department of Electronics and Electrical Engineering at the Indian Institute of Technology Guwahati.

🔗 **Live Website**: [https://harshra1-ultra.github.io/harsh/](https://harshra1-ultra.github.io/harsh/)

---

## 🚀 Key Features

### 1. Academic Portfolio (`index.html`)
- **Modern Glassmorphic Design**: A premium dark/light mode UI with smooth animations, custom scrollbars, and interactive transitions.
- **Dynamic Particle Canvas**: A high-performance interactive HTML5 canvas rendering background node particles with mouse-repelling physics.
- **Publication Hub**: Staggered cards showcasing publications, with direct access to local PDF papers, links to IEEE Xplore, and an interactive **BibTeX citation copier**.
- **SEO & Schema Integration**: Fully optimized for search engines with JSON-LD structured schema metadata, Open Graph cards, and a certified sitemap.

### 2. Academic Curriculum Vitae (`cv.html`)
- **Structured CV sections**: Comprehensive listings for Education, Publications, Teaching Assistantships, research fields, and specialized technical tools.
- **Print & ATS Friendly**: Integrated a custom `@media print` style sheet that transforms the page into a clean, A4-friendly black-and-white print document, hiding non-printable page controls.
- **Downloadable CV**: Provides direct access to print the page or download the profile CV in PDF format (`Harsh_Raj_CV.pdf`).

### 3. Interactive Rician Fading Channel Simulator (`second-page.html`)
- **Real-Time Web Simulator**: Dynamic modeling of Rician channels using four synchronized canvas plots:
  1. In-phase and Quadrature Gaussian components.
  2. Complex scatter plane showing constellation points.
  3. Amplitude PDF comparison (Experimental histogram vs. theoretical curve).
  4. Phase PDF comparison (Experimental histogram vs. theoretical curve).
- **LaTeX Math Equations**: Integrated MathJax for high-fidelity rendering of Rician amplitude and phase probability density functions (PDF) side-by-side.
- **MATLAB Integration**: Includes a download option for the standalone MATLAB simulation script (`rician_simulation.m`).
- **Responsive Layout**: Adapts from a 2-column slider dashboard into a single-column layout on mobile viewports under `600px`.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom transitions, keyframe animations, glassmorphism), JavaScript ES6.
- **Libraries & CDNs**:
  - [MathJax v3](https://www.mathjax.org/) (LaTeX typesetting)
  - [FontAwesome v6.5.1](https://fontawesome.com/) (Vector icon suite)
  - [Google Fonts](https://fonts.google.com/) (Outfit & Inter font families)
- **Deployment**: GitHub Pages.

---

## 📂 Repository Structure

```files
├── index.html                  # Academic portfolio homepage
├── second-page.html            # Web-based Rician fading simulator
├── cv.html                     # Academic CV page
├── Harsh_Raj_CV.pdf            # Downloadable CV PDF document
├── rician_simulation.m         # MATLAB simulation script
├── paper_plane.gif             # Hero section paper plane animation
├── *.pdf                       # Scientific publications PDF files
├── sitemap.xml                 # Search engine sitemap
├── robots.txt                  # Search engine crawl rules
└── README.md                   # Project documentation
```

---

## 🧑‍💻 How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Harshra1-ultra/harsh.git
   ```
2. Navigate to the project directory:
   ```bash
   cd harsh
   ```
3. Open `index.html` in your browser. All styles, scripts, and simulation tools run client-side without requiring a backend server.
