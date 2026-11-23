import { About } from './components/About';
import { Footer } from './components/Footer';
import { Games } from './components/Games';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Music } from './components/Music';
import { PageScrollbar } from './components/PageScrollbar';
import { Pc } from './components/Pc';
import { Projects } from './components/Projects';
import { Steam } from './components/Steam';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Games />
        <Pc />
        <Steam />
        <Projects />
        <Music />
      </main>
      <Footer />
      <PageScrollbar />
    </>
  );
}
