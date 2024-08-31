import React from 'react';
import './css/footer.css'
/**
 * Footer component that displays the footer section of the application.
 * Includes a copyright notice.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
function Footer() {
  return (
    <footer className="footer bg-dark text-white text-center py-3 footer">
      <div className="container">
        <p>&copy; 2024 movFlix. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
