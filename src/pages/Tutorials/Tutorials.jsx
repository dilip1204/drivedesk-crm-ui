import React, { useState } from "react";
import { Modal } from "react-bootstrap";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./Tutorials.css";

const TUTORIALS = [
  {
    id: "03fdQKnhX70",
    title: "Training Session Remarks Update Now Easy in DriveDesk",
    description: "See the improved remarks dropdown, predefined training options, and simpler session tracking.",
    duration: "1:20",
    topic: "Training Session",
  },
];

export default function Tutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  const closeVideo = () => setSelectedTutorial(null);

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />

          <div className="content-wrapper">
            <div className="content tutorials-page">
              <div className="tutorials-heading">
                <div>
                  <h1>Tutorials</h1>
                  <p>Watch short guides for common DriveDesk workflows.</p>
                </div>
              </div>

              <div className="tutorials-grid">
                {TUTORIALS.map((tutorial) => (
                  <button
                    type="button"
                    className="tutorial-card"
                    key={tutorial.id}
                    onClick={() => setSelectedTutorial(tutorial)}
                    aria-label={`Play ${tutorial.title}`}
                  >
                    <span className="tutorial-thumbnail">
                      <img
                        src={`https://img.youtube.com/vi/${tutorial.id}/hqdefault.jpg`}
                        alt={`${tutorial.title} thumbnail`}
                      />
                      <span className="tutorial-play" aria-hidden="true">
                        <i className="mdi mdi-play" />
                      </span>
                      <span className="tutorial-duration">{tutorial.duration}</span>
                    </span>
                    <span className="tutorial-copy">
                      <span className="tutorial-topic">{tutorial.topic}</span>
                      <strong>{tutorial.title}</strong>
                      <span className="tutorial-description">{tutorial.description}</span>
                      <span className="tutorial-card-footer">
                        <span>Watch tutorial</span>
                        <i className="mdi mdi-arrow-right" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>

      <Modal show={Boolean(selectedTutorial)} onHide={closeVideo} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTutorial?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="tutorial-modal-body">
          {selectedTutorial && (
            <div className="tutorial-player">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTutorial.id}?autoplay=1&rel=0`}
                title={selectedTutorial.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}