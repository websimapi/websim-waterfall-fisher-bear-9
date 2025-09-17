import * as THREE from 'three';

const waterMat = new THREE.MeshLambertMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.8 });
const foamMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
const particleMat = new THREE.MeshBasicMaterial({ color: 0x967969, transparent: true, opacity: 0.6 });
const riverbedMat = new THREE.MeshLambertMaterial({ color: 0xc2b280 });

export function createWaterfall() {
    const group = new THREE.Group();
    group.name = "waterfall";
    const waterWidth = 8;
    const cliffEdgeZ = 2.5;
    const cliffTopY = 2;

    const riverbedGeo = new THREE.PlaneGeometry(waterWidth, 30);
    const riverbed = new THREE.Mesh(riverbedGeo, riverbedMat);
    riverbed.rotation.x = -Math.PI / 2;
    riverbed.position.set(0, 0, cliffEdgeZ - 15);
    group.add(riverbed);

    const groundBelowFallGeo = new THREE.PlaneGeometry(waterWidth, 10);
    const groundBelowFall = new THREE.Mesh(groundBelowFallGeo, riverbedMat);
    groundBelowFall.rotation.x = -Math.PI / 2;
    groundBelowFall.position.set(0, 0, cliffEdgeZ + 5);
    group.add(groundBelowFall);

    const riverGeo = new THREE.PlaneGeometry(waterWidth, 30);
    const river = new THREE.Mesh(riverGeo, waterMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, cliffTopY, cliffEdgeZ - 15);
    group.add(river);
    const fallGeo = new THREE.PlaneGeometry(waterWidth, 20);
    const fall = new THREE.Mesh(fallGeo, waterMat);
    fall.position.set(0, cliffTopY - 10, cliffEdgeZ);
    group.add(fall);
    for (let i = 0; i < 50; i++) {
        const foam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), foamMat);
        const onRiver = Math.random() > 0.4;
        foam.userData.onRiver = onRiver;
        if (onRiver) {
            foam.position.set((Math.random() - 0.5) * (waterWidth - 1), cliffTopY + 0.1, cliffEdgeZ - (Math.random() * 30));
            foam.userData.velocity = new THREE.Vector3(0, 0, Math.random() * 0.05 + 0.05);
        } else {
            foam.position.set((Math.random() - 0.5) * (waterWidth - 1), cliffTopY - (Math.random() * 20), cliffEdgeZ);
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
            } else if (!child.userData.onRiver && child.position.y < cliffTopY - 20) {
                child.position.y = cliffTopY;
            }
        }
    });
}