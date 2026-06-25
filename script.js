const courses = [
    { name: "Phase II Committee Courses (Integrated)", credits: 46 },
    { name: "Elective course first semester", credits: 4 },
    { name: "Elective course second semester", credits: 4 },
    { name: "Medical Research II", credits: 2 },
    { name: "Principles of Atatürk and History of Turkish Revolution I", credits: 2 },
    { name: "Principles of Atatürk and History of Turkish Revolution II", credits: 2 }
];

function convertScore(score) {
    if (score === null || score === "" || isNaN(score)) return { grade: "-", value: null };
    if (score >= 90 && score <= 100) return { grade: "AA", value: 4.00 };
    if (score >= 85 && score <= 89)  return { grade: "BA", value: 3.50 };
    if (score >= 75 && score <= 84)  return { grade: "BB", value: 3.00 };
    if (score >= 70 && score <= 74)  return { grade: "CB", value: 2.50 };
    if (score >= 60 && score <= 69)  return { grade: "CC", value: 2.00 };
    if (score >= 0  && score <= 59)  return { grade: "FF", value: 0.00 };
    return { grade: "Invalid", value: null };
}

window.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('course-rows');
    const enableCgpaToggle = document.getElementById('enable-cgpa');
    const cgpaInputsPanel = document.getElementById('cgpa-inputs-panel');
    const phase1GpaInput = document.getElementById('phase1-gpa');
    const phase1CreditsInput = document.getElementById('phase1-credits');

    // Build Phase II Row Elements
    courses.forEach((course, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="course-name">${course.name}</span></td>
            <td><span class="course-credits">${course.credits} Cr</span></td>
            <td><input type="number" min="0" max="100" placeholder="0-100" class="score-input" data-index="${index}"></td>
            <td><span class="grade-badge" id="grade-${index}">-</span></td>
        `;
        tbody.appendChild(tr);
    });

    // Event Listeners for Live Math Changes
    tbody.addEventListener('input', calculateGPA);
    enableCgpaToggle.addEventListener('change', () => {
        cgpaInputsPanel.classList.toggle('hidden', !enableCgpaToggle.checked);
        calculateGPA();
    });
    phase1GpaInput.addEventListener('input', calculateGPA);
    phase1CreditsInput.addEventListener('input', calculateGPA);
});

function calculateGPA() {
    let phase2Points = 0;
    let phase2WeightedScores = 0;
    let phase2Credits = 0;

    courses.forEach((course, index) => {
        const input = document.querySelector(`input[data-index="${index}"]`);
        const score = input && input.value !== "" ? parseFloat(input.value) : null;
        
        const conversion = convertScore(score);
        const gradeCell = document.getElementById(`grade-${index}`);

        if (conversion.value !== null && conversion.grade !== "Invalid") {
            gradeCell.textContent = conversion.grade;
            gradeCell.className = conversion.grade === "FF" ? "grade-badge fail-grade" : "grade-badge active-grade";
            
            phase2Points += (course.credits * conversion.value);
            phase2WeightedScores += (score * course.credits);
            phase2Credits += course.credits;
        } else {
            gradeCell.textContent = "-";
            gradeCell.className = "grade-badge";
        }
    });

    // UI elements references
    const gpaOutput = document.getElementById('gpa-output');
    const scoreOutput = document.getElementById('score-output');
    const creditsOutput = document.getElementById('credits-output');
    const cgpaOutput = document.getElementById('cgpa-output');
    const cgpaFooter = document.getElementById('cgpa-footer');

    let currentPhase2Gpa = 0;

    // 1. Process Phase II Display Metrics
    if (phase2Credits > 0) {
        currentPhase2Gpa = phase2Points / phase2Credits;
        const finalScore = phase2WeightedScores / phase2Credits;

        gpaOutput.textContent = currentPhase2Gpa.toFixed(3);
        scoreOutput.textContent = finalScore.toFixed(2) + "%";
        creditsOutput.textContent = `${phase2Credits} of 60 Phase II Credits Active`;
    } else {
        gpaOutput.textContent = "0.000";
        scoreOutput.textContent = "0.00%";
        creditsOutput.textContent = "0 of 60 Phase II Credits Active";
    }

    // 2. Cumulative CGPA Calculation execution
    const cgpaEnabled = document.getElementById('enable-cgpa').checked;
    
    if (cgpaEnabled) {
        const p1Gpa = parseFloat(document.getElementById('phase1-gpa').value);
        const p1Credits = parseFloat(document.getElementById('phase1-credits').value);

        if (!isNaN(p1Gpa) && !isNaN(p1Credits) && p1Credits >= 0) {
            // Reconstruct total grade points earned during Phase I
            const phase1Points = p1Gpa * p1Credits;
            
            const totalCombinedPoints = phase1Points + phase2Points;
            const totalCombinedCredits = p1Credits + phase2Credits;

            if (totalCombinedCredits > 0) {
                const combinedCgpa = totalCombinedPoints / totalCombinedCredits;
                cgpaOutput.textContent = combinedCgpa.toFixed(3);
                cgpaFooter.textContent = `Combined: ${totalCombinedCredits} Total Credits`;
            } else {
                cgpaOutput.textContent = "0.000";
                cgpaFooter.textContent = "0 Total Credits";
            }
        } else {
            cgpaOutput.textContent = "---";
            cgpaFooter.textContent = "Enter valid Phase I data above";
        }
    } else {
        // Fallback default state if toggle is switched off
        cgpaOutput.textContent = "0.000";
        cgpaFooter.textContent = "Toggle panel option on to track";
    }
}