import { useText } from '../../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { content } = useText();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} {content.footer.copyright}.</p>
        <div className="footer-links">
          <span>{content.footer.instagram}</span>
          <span>{content.footer.facebook}</span>
          <span>{content.footer.legal}</span>
        </div>
      </div>
    </footer>
  );
}