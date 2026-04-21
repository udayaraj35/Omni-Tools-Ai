'use client';

import React from "react";

const AdvancedCard = React.forwardRef<HTMLDivElement, any>(({ data, size, isPro }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: size.width,
        height: size.height,
        background: data.theme,
        color: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px",
        borderRadius: "30px",
        position: 'relative'
      }}
    >
      <h1 style={{ fontSize: "3rem", textAlign: "center" }}>
        {data.title}
      </h1>

      {data.photo && (
        <img
          src={data.photo}
          alt="Event Visual"
          crossOrigin="anonymous"
          style={{
            width: "60%",
            alignSelf: "center",
            borderRadius: "20px"
          }}
        />
      )}

      <p style={{ textAlign: "center", fontSize: "1.5rem" }}>
        {data.caption}
      </p>
      
      {!isPro && (
        <div style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          opacity: 0.5
        }}>
          OmniTools AI
        </div>
      )}
    </div>
  );
});

AdvancedCard.displayName = "AdvancedCard";

export default AdvancedCard;
