import * as THREE from 'three';

const waterMat = new THREE.MeshLambertMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.8 });
const foamMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
const particleMat = new THREE.MeshBasicMaterial({ color: 0x967969, transparent: true, opacity: 0.6 });
const riverbedMat = new THREE.MeshLambertMaterial({ color: 0xc2b280 });
const rockFaceMat = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Rock color for cliff

export function createWaterfall() {
    const group = new THREE.Group();
    group.name = "waterfall";
    const waterWidth = 7; // Adjusted to match scenery gap
    const cliffEdgeZ = 2.5;
    const cliffTopY = 2;

    const riverbedGeo = new THREE.PlaneGeometry(waterWidth, 30);
    const riverbed = new THREE.Mesh(riverbedGeo, riverbedMat);
    riverbed.rotation.x = -Math.PI / 2;
    riverbed.position.set(0, 0, cliffEdgeZ - 15);
    group.add(riverbed);

    // Create a vertical rock face behind the waterfall
    const fallHeight = 20; // The height of the waterfall drop
    const fallBackdropGeo = new THREE.PlaneGeometry(waterWidth, fallHeight);
    const fallBackdrop = new THREE.Mesh(fallBackdropGeo, rockFaceMat);
    fallBackdrop.position.set(0, cliffTopY - fallHeight / 2, cliffEdgeZ - 0.1); // Positioned right behind the water
    group.add(fallBackdrop);

    // Ground below the fall now acts as a continuous riverbed
    const groundBelowFallGeo = new THREE.PlaneGeometry(waterWidth, 20);
    const groundBelowFall = new THREE.Mesh(groundBelowFallGeo, riverbedMat);
    groundBelowFall.rotation.x = -Math.PI / 2;
    groundBelowFall.position.set(0, 0, cliffEdgeZ + 10); // Set Y to 0 for seamless riverbed
    group.add(groundBelowFall);

    const riverGeo = new THREE.PlaneGeometry(waterWidth, 30);
    const river = new THREE.Mesh(riverGeo, waterMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, cliffTopY, cliffEdgeZ - 15);
    group.add(river);
    const fallGeo = new THREE.PlaneGeometry(waterWidth, fallHeight);
    const fall = new THREE.Mesh(fallGeo, waterMat);
    fall.position.set(0, cliffTopY - fallHeight / 2, cliffEdgeZ);
    group.add(fall);
    for (let i = 0; i < 50; i++) {
        const foam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), foamMat);
        const onRiver = Math.random() > 0.4;
        foam.userData.onRiver = onRiver;
        if (onRiver) {
            foam.position.set((Math.random() - 0.5) * (waterWidth - 1), cliffTopY + 0.1, cliffEdgeZ - (Math.random() * 30));
            foam.userData.velocity = new THREE.Vector3(0, 0, Math.random() * 0.05 + 0.05);
        } else {
            foam.position.set((Math.random() - 0.5) * (waterWidth - 1), cliffTopY - (Math.random() * fallHeight), cliffEdgeZ);
            foam.userData.velocity = new THREE.Vector3(0, -(Math.random() * 0.1 + 0.1), 0);
        }
        group.add(foam);
    }

    // Underwater particles
    for (let i = 0; i < 100; i++) {
        const particleSize = 0.05 + Math.random() * 0.1;
        const particleGeo = new THREE.BoxGeometry(particleSize, particleSize, particleSize);
        const particle = new THREE.Mesh(particleGeo, particleMat);
        
        particle.position.set(
            (Math.random() - 0.5) * (waterWidth - 1),
            Math.random() * cliffTopY, // from riverbed to surface
            cliffEdgeZ - (Math.random() * 30)
        );
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() * 0.03 + 0.02)
        );
        particle.userData.isUnderwaterParticle = true;
        group.add(particle);
    }
    
    return group;
}

export function updateWaterfall(waterfallGroup) {
    if (!waterfallGroup) return;
    const cliffEdgeZ = 2.5;
    const cliffTopY = 2;
    const fallHeight = 20;
    waterfallGroup.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.add(child.userData.velocity);
            if (child.userData.isUnderwaterParticle) {
                 if (child.position.z > cliffEdgeZ) {
                    child.position.z = cliffEdgeZ - 30; // reset to back
                }
                if (child.position.y > cliffTopY || child.position.y < 0) {
                    child.userData.velocity.y *= -1; // bounce off top/bottom
                }
            } else if (child.userData.onRiver && child.position.z > cliffEdgeZ) {
                child.position.z = cliffEdgeZ - 30;
            } else if (!child.userData.onRiver && child.position.y < cliffTopY - fallHeight) {
                child.position.y = cliffTopY;
            }
        }
    });
}