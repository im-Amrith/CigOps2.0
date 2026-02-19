import { useState } from "react";
import "./PrivacyModal.css";

export default function PrivacyModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="privacy-button" onClick={() => setOpen(true)}>
        Privacy Policy
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Privacy Policy</h2>
              <button className="close-button" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Your privacy is important to us. This app collects and processes the following data:
              </p>
              <ul>
                <li>Your messages to the AI coach</li>
                <li>Your mood, craving intensity, and quit progress</li>
                <li>Usage statistics to improve the service</li>
              </ul>
              <p>
                We do not share your personal data with third parties without your consent.
                All data is stored securely and processed in accordance with HIPAA and GDPR regulations.
              </p>
              <p>
                You can request deletion of your data at any time by contacting our support team.
              </p>
            </div>
            <div className="modal-footer">
              <button className="accept-button" onClick={() => setOpen(false)}>
                I Understand
              </button>
            </div>
          </div>
    </div>
      )}
    </>
  );
}