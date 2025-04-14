import React from "react";
import useBEMNaming from "../../common/useBEMNaming";
import "./AboutUs.scss";
import Header from "../Header/Header";

export default function AboutUs(props) {
  const { getBlock, getElement } = useBEMNaming("about-us-section");

  return (
    <>
      <Header />
      <div ref={props.modelDetailsRef} className={getBlock()}>
        <section className={getElement("intro")}>
          <div className={getElement("text")}>
            <h1>About Us</h1>
            <p>
              Our company and culture are a lot like our product. They're crafted, not cobbled,
              for a delightful experience.
            </p>
          </div>
          <div className={getElement("image")}>
            <img src="https://photos.smugmug.com/Years/2024/240432-National-AI-Institute-JinJun-Xiong-student-Lockwood/i-pB25Kvh/0/MWrG4xhqQMTxHwtQ6H3tpjFVmzv7kNWKKbFD4KxF9/X4/0Y1A0070-X4.jpg" alt="Team photo" />
          </div>
        </section>

        <section className={getElement("mission")}>
          <div className={getElement("image")}>
            <img src="https://photos.smugmug.com/Years/2024/240382-AI-Institute-Exceptional-Edu-Xiong-Students-Lockwood/i-hVfcFQk/0/MwRpqtXF2zJHhQdqKW4GsdSZPvS56CsT3WdQWsSC6/M/1A1A0053-M.jpg" alt="Grow Better Office" />
          </div>
          <div className={getElement("text")}>
            <h2>Our Mission: Helping Millions of Organizations Grow Better</h2>
            <p>
              We believe not just in growing bigger, but in growing better. And growing better means
              aligning the success of your own business with the success of your customers. Win-win!
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
