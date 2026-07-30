import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  isLand: boolean;
}

interface ActiveNode {
  name: string;
  lat: number;  // in radians
  lon: number;  // in radians
  pulse: number;
}

export const HolographicGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 540);
    let height = (canvas.height = 540);

    const radius = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    const tilt = 23.5 * (Math.PI / 180); // Earth's axis tilt

    // World Continent approximation
    const isLand = (lat: number, lon: number): boolean => {
      // Antarctica
      if (lat < -1.1) return true;
      // North America
      if (lat > 0.1 && lon < -0.8 && lon > -2.8) {
        if (lat > 0.8) return true;
        if (lon > -2.2) return true;
      }
      // South America
      if (lat <= 0.1 && lat > -1.0 && lon < -0.6 && lon > -1.5) {
        return true;
      }
      // Africa
      if (lat > -0.6 && lat < 0.6 && lon > -0.3 && lon < 0.9) {
        if (!(lat > 0.2 && lon < 0.0)) return true;
      }
      // Eurasia
      if (lat >= 0.1 && lon > -0.2 && lon < 3.0) {
        if (lat < 1.3) return true;
      }
      // Australia
      if (lat < -0.2 && lat > -0.8 && lon > 1.8 && lon < 2.8) {
        return true;
      }
      // Greenland
      if (lat > 1.0 && lon > -1.3 && lon < -0.3) return true;

      return false;
    };

    // Generate Points on Sphere
    const spherePoints: Point3D[] = [];
    const totalPoints = 900;
    for (let i = 0; i < totalPoints; i++) {
      // Fibonacci sphere distribution
      const y = 1 - (i / (totalPoints - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = 3.8196601125010515 * i; // golden angle
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      // Convert Cartesian to Spherical coordinates
      const lat = Math.asin(y);
      const lon = Math.atan2(z, x);

      // Noise factor for organic shorelines
      const noise = Math.sin(lat * 35) * Math.cos(lon * 35) * 0.08;
      const landCheck = isLand(lat + noise, lon);

      spherePoints.push({ x, y, z, isLand: landCheck });
    }

    // Active AI Nodes on Globe
    const activeNodes: ActiveNode[] = [
      { name: 'TIRUPPUR NODE', lat: 11.1085 * (Math.PI / 180), lon: 77.3411 * (Math.PI / 180), pulse: 0 },
      { name: 'CHENNAI HUB', lat: 13.0827 * (Math.PI / 180), lon: 80.2707 * (Math.PI / 180), pulse: 0.3 },
      { name: 'MUMBAI LOGISTICS', lat: 19.0760 * (Math.PI / 180), lon: 72.8777 * (Math.PI / 180), pulse: 0.6 },
      { name: 'EUROPE GATEWAY', lat: 48.8566 * (Math.PI / 180), lon: 2.3522 * (Math.PI / 180), pulse: 0.15 },
      { name: 'US EAST DIGITAL', lat: 40.7128 * (Math.PI / 180), lon: -74.0060 * (Math.PI / 180), pulse: 0.45 },
    ];

    let angle = 0;

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Increment rotation angle
      angle += 0.0035;

      // 1. Draw Atmospheric Glow behind the globe
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius - 20, centerX, centerY, radius + 40);
      glowGrad.addColorStop(0, 'rgba(63, 230, 168, 0.03)');
      glowGrad.addColorStop(0.5, 'rgba(48, 213, 255, 0.05)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 40, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Helper function to rotate 3D point
      const rotatePoint = (x: number, y: number, z: number) => {
        // Spin Y rotation
        const cosY = Math.cos(angle);
        const sinY = Math.sin(angle);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Axis tilt rotation
        const cosX = Math.cos(tilt);
        const sinX = Math.sin(tilt);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
      };

      // 2. Draw Longitude/Latitude Grid Lines
      ctx.lineWidth = 0.5;
      const numLines = 8;
      for (let j = -numLines / 2; j <= numLines / 2; j++) {
        // Latitude circles
        const latVal = (j / (numLines / 2 + 1)) * (Math.PI / 2);
        const yCirc = Math.sin(latVal);
        const rCirc = Math.cos(latVal);

        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
          const xVal = Math.cos(a) * rCirc;
          const zVal = Math.sin(a) * rCirc;
          const rotated = rotatePoint(xVal, yCirc, zVal);

          if (rotated.z > 0) {
            const screenX = centerX + rotated.x * radius;
            const screenY = centerY + rotated.y * radius;
            if (a === 0) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
        }
        ctx.strokeStyle = 'rgba(48, 213, 255, 0.04)';
        ctx.stroke();
      }

      // Meridians (Longitude lines)
      for (let j = 0; j < numLines; j++) {
        const lonVal = (j / numLines) * Math.PI * 2;
        ctx.beginPath();
        for (let latVal = -Math.PI / 2; latVal <= Math.PI / 2 + 0.1; latVal += 0.1) {
          const xVal = Math.cos(lonVal) * Math.cos(latVal);
          const yVal = Math.sin(latVal);
          const zVal = Math.sin(lonVal) * Math.cos(latVal);
          const rotated = rotatePoint(xVal, yVal, zVal);

          if (rotated.z > 0) {
            const screenX = centerX + rotated.x * radius;
            const screenY = centerY + rotated.y * radius;
            if (latVal === -Math.PI / 2) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
        }
        ctx.strokeStyle = 'rgba(63, 230, 168, 0.03)';
        ctx.stroke();
      }

      // 3. Draw Outer Orbiting Coordinate Rings
      ctx.lineWidth = 0.75;
      const drawOrbitRing = (scale: number, speedMult: number, color: string, alpha: number) => {
        const ringAngle = angle * speedMult;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.05) {
          // Orbit path tilted on X and Z axis
          const rx = Math.cos(a) * radius * scale;
          const rz = Math.sin(a) * radius * scale;
          const ry = Math.sin(a) * Math.cos(ringAngle) * 20;

          // Rotation projection
          const cosR = Math.cos(tilt * 0.7);
          const sinR = Math.sin(tilt * 0.7);
          const rxRot = rx * cosR - rz * sinR;
          const rzRot = rx * sinR + rz * cosR;

          const screenX = centerX + rxRot;
          const screenY = centerY + ry;

          if (a === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.strokeStyle = `${color}${alpha})`;
        ctx.stroke();
      };

      drawOrbitRing(1.15, -0.6, 'rgba(48, 213, 255, ', 0.15);
      drawOrbitRing(1.22, 0.45, 'rgba(63, 230, 168, ', 0.1);

      // 4. Draw Continent Nodes
      spherePoints.forEach((p) => {
        const rotated = rotatePoint(p.x, p.y, p.z);
        if (rotated.z > 0) {
          const screenX = centerX + rotated.x * radius;
          const screenY = centerY + rotated.y * radius;

          // Soft lighting / depth cue by scaling points based on z coordinate
          const size = p.isLand ? (1.5 + rotated.z * 1.5) : 0.75;
          const opacity = rotated.z * (p.isLand ? 0.75 : 0.12);

          ctx.beginPath();
          ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          ctx.fillStyle = p.isLand
            ? `rgba(63, 230, 168, ${opacity})`
            : `rgba(48, 213, 255, ${opacity})`;
          ctx.fill();
        }
      });

      // 5. Draw Orbiting Satellites / Tiny Scanning indicators
      const satAngle = angle * 1.2;
      const satX = centerX + Math.cos(satAngle) * radius * 1.25;
      const satY = centerY + Math.sin(satAngle) * Math.sin(tilt) * radius * 1.25;
      
      // Satellite marker
      ctx.beginPath();
      ctx.arc(satX, satY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#30D5FF';
      ctx.shadowColor = '#30D5FF';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Satellite scanning ring
      ctx.beginPath();
      ctx.arc(satX, satY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(48, 213, 255, 0.25)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 6. Draw AI Location Markers & Connected Node Paths
      const projectedNodes = activeNodes.map((node) => {
        // Calculate 3D sphere coordinate
        const latY = Math.sin(node.lat);
        const rLat = Math.cos(node.lat);
        const lonX = Math.cos(node.lon) * rLat;
        const lonZ = Math.sin(node.lon) * rLat;

        const rotated = rotatePoint(lonX, latY, lonZ);
        return { ...node, rotated };
      });

      projectedNodes.forEach((node) => {
        if (node.rotated.z > 0) {
          const screenX = centerX + node.rotated.x * radius;
          const screenY = centerY + node.rotated.y * radius;

          // Pulse increment
          node.pulse += 0.015;
          if (node.pulse > 1) node.pulse = 0;

          // Glowing node ring
          ctx.beginPath();
          ctx.arc(screenX, screenY, 4 + node.pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(63, 230, 168, ${1 - node.pulse})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Small core node dot
          ctx.beginPath();
          ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#3FE6A8';
          ctx.fill();

          // Anchor vertical line
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX, screenY - 24);
          ctx.strokeStyle = 'rgba(63, 230, 168, 0.4)';
          ctx.lineWidth = 0.75;
          ctx.stroke();

          // Text label
          ctx.fillStyle = '#B9C4CC';
          ctx.font = 'bold 8px Geist, monospace';
          ctx.fillText(node.name, screenX + 6, screenY - 22);
        }
      });

      // 7. Draw connection lines between front facing AI nodes
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i];
        if (n1.rotated.z <= 0) continue;

        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n2 = projectedNodes[j];
          if (n2.rotated.z <= 0) continue;

          // Only draw connection if distance on sphere is within limits
          const dx = n1.rotated.x - n2.rotated.x;
          const dy = n1.rotated.y - n2.rotated.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 1.4) {
            const screenX1 = centerX + n1.rotated.x * radius;
            const screenY1 = centerY + n1.rotated.y * radius;
            const screenX2 = centerX + n2.rotated.x * radius;
            const screenY2 = centerY + n2.rotated.y * radius;

            ctx.beginPath();
            ctx.moveTo(screenX1, screenY1);
            ctx.lineTo(screenX2, screenY2);
            ctx.strokeStyle = `rgba(63, 230, 168, ${0.18 * n1.rotated.z * n2.rotated.z})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-[540px] h-[540px] flex items-center justify-center select-none pointer-events-none">
      {/* Volumetric ambient back-glow */}
      <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-[#3FE6A8]/5 to-[#2DD4FF]/5 blur-[60px] animate-pulse pointer-events-none" />
      
      {/* Interactive 3D Orbiting Scan Overlay */}
      <div className="absolute w-[480px] h-[480px] rounded-full border border-[#2DD4FF]/5 animate-[spin_40s_linear_infinite]" />
      <div className="absolute w-[500px] h-[500px] rounded-full border border-[#3FE6A8]/5 animate-[spin_55s_linear_infinite_reverse]" />

      <canvas ref={canvasRef} className="relative z-10" />
    </div>
  );
};
export default HolographicGlobe;
