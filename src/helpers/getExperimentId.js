export default function getExperimentId(location) {
    const pathSegments = location.pathname.split('/');
    const experimentIndex = pathSegments.indexOf('experiment');
    return experimentIndex !== -1 ? pathSegments[experimentIndex + 1] : null;
}