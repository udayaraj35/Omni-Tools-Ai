'use client';

import React from "react";

const EventCard = React.forwardRef<HTMLDivElement, any>(({ data, size }, ref) => {
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
        borderRadius: "30px"
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
    </div>
  );
});

EventCard.displayName = "EventCard";

export default EventCard;
