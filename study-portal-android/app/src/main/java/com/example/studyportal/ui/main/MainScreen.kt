package com.example.studyportal.ui.main

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
) {
  val context = LocalContext.current

  // State definitions
  var selectedUniversity by remember { mutableStateOf("AKTU") }
  var selectedCourse by remember { mutableStateOf("B.Tech") }
  var selectedBranch by remember { mutableStateOf("CSE-AIML") }
  var selectedSemester by remember { mutableStateOf("Semester 5") }
  var subjects by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
  var loading by remember { mutableStateOf(false) }

  // Dropdown expansion states
  var uniExpanded by remember { mutableStateOf(false) }
  var courseExpanded by remember { mutableStateOf(false) }
  var branchExpanded by remember { mutableStateOf(false) }
  var semExpanded by remember { mutableStateOf(false) }

  // Constant options lists
  val universities = listOf("AKTU", "BTEUP", "CCSU", "DBRAU", "VTU", "SPPU", "JNTU", "RGPV", "RTU", "MAKAUT", "GTU", "PTU")
  val courses = listOf("B.Tech", "M.Tech", "Diploma", "BCA", "MCA", "B.Sc", "BBA", "MBA", "B.Pharm", "D.Pharm")
  val branches = listOf("CSE-AIML", "CSE", "IT", "ECE", "EE", "ME", "CE", "CH", "BT")
  val semesters = (1..8).map { "Semester $it" }

  // Fetch subjects dynamically from api server whenever any filter changes
  LaunchedEffect(selectedUniversity, selectedCourse, selectedBranch, selectedSemester) {
    loading = true
    try {
      val encodedUniv = URLEncoder.encode(selectedUniversity, "UTF-8")
      val encodedCourse = URLEncoder.encode(selectedCourse, "UTF-8")
      val encodedBranch = URLEncoder.encode(selectedBranch, "UTF-8")
      val encodedSem = URLEncoder.encode(selectedSemester, "UTF-8")

      val urlString = "http://10.0.2.2:5000/api/study/subjects?university=$encodedUniv&course=$encodedCourse&branch=$encodedBranch&semester=$encodedSem"

      val result = withContext(Dispatchers.IO) {
        val url = URL(urlString)
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connectTimeout = 3000
        connection.readTimeout = 3000

        if (connection.responseCode == 200) {
          val text = connection.inputStream.bufferedReader().use { it.readText() }
          val jsonArray = JSONArray(text)
          val list = mutableListOf<Pair<String, String>>()
          for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            list.add(Pair(obj.getString("code"), obj.getString("name")))
          }
          list
        } else {
          null
        }
      }

      if (result != null) {
        subjects = result
      } else {
        subjects = getFallbackSubjects(selectedBranch)
      }
    } catch (e: Exception) {
      subjects = getFallbackSubjects(selectedBranch)
    } finally {
      loading = false
    }
  }

  // Neon Premium Colors
  val neonCyan = Color(0xFF00D4FF)
  val neonPurple = Color(0xFF9F7AEA)

  // Glassmorphism Card Style
  val cardBg = Color(0x14FFFFFF) // 8% white translucent
  val glassBorder = BorderStroke(
    width = 1.dp,
    brush = Brush.linearGradient(
      colors = listOf(neonCyan.copy(alpha = 0.35f), neonPurple.copy(alpha = 0.15f))
    )
  )

  // Vibrant Vertical Gradient Background
  val backgroundGradient = Brush.verticalGradient(
    colors = listOf(
      Color(0xFF060913),
      Color(0xFF0C132E),
      Color(0xFF150F2E)
    )
  )

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(backgroundGradient)
  ) {
    // Glowing Blurred Aura Circles on Background Canvas
    androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
      drawCircle(
        brush = Brush.radialGradient(
          colors = listOf(Color(0x1F00D4FF), Color.Transparent),
          radius = 350.dp.toPx()
        ),
        center = androidx.compose.ui.geometry.Offset(x = size.width * 0.15f, y = size.height * 0.2f),
        radius = 350.dp.toPx()
      )
      drawCircle(
        brush = Brush.radialGradient(
          colors = listOf(Color(0x179F7AEA), Color.Transparent),
          radius = 450.dp.toPx()
        ),
        center = androidx.compose.ui.geometry.Offset(x = size.width * 0.85f, y = size.height * 0.75f),
        radius = 450.dp.toPx()
      )
    }

    LazyColumn(
      modifier = modifier
        .fillMaxSize()
        .padding(horizontal = 12.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp),
      contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {

      // Header Banner
      item {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = cardBg),
          modifier = Modifier
            .fillMaxWidth()
            .border(glassBorder, RoundedCornerShape(20.dp))
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Surface(
              shape = RoundedCornerShape(100.dp),
              color = neonCyan.copy(alpha = 0.08f),
              border = BorderStroke(1.dp, neonCyan.copy(alpha = 0.3f))
            ) {
              Text(
                text = "🎓 Multi-University Resources Hub",
                color = neonCyan,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
              )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
              text = "Study Material & Papers",
              color = Color.White,
              fontSize = 22.sp,
              fontWeight = FontWeight.ExtraBold,
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = "Access syllabi, notes, quantum series, and carryover question papers dynamically.",
              color = Color.LightGray.copy(alpha = 0.7f),
              fontSize = 12.sp,
              textAlign = TextAlign.Center
            )
          }
        }
      }

      // Selectors Card
      item {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = cardBg),
          modifier = Modifier
            .fillMaxWidth()
            .border(glassBorder, RoundedCornerShape(20.dp))
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("🔍 Search Catalog", color = neonCyan, fontWeight = FontWeight.Bold, fontSize = 14.sp)

            // University Select
            FilterDropdown(
              label = "University",
              selected = selectedUniversity,
              expanded = uniExpanded,
              onExpandChange = { uniExpanded = it },
              options = universities,
              onSelect = { selectedUniversity = it }
            )

            // Course Select
            FilterDropdown(
              label = "Course",
              selected = selectedCourse,
              expanded = courseExpanded,
              onExpandChange = { courseExpanded = it },
              options = courses,
              onSelect = { selectedCourse = it }
            )

            // Branch Select
            FilterDropdown(
              label = "Branch",
              selected = selectedBranch,
              expanded = branchExpanded,
              onExpandChange = { branchExpanded = it },
              options = branches,
              onSelect = { selectedBranch = it }
            )

            // Semester Select
            FilterDropdown(
              label = "Semester",
              selected = selectedSemester,
              expanded = semExpanded,
              onExpandChange = { semExpanded = it },
              options = semesters,
              onSelect = { selectedSemester = it }
            )
          }
        }
      }

      // Dynamic Section Header
      item {
        Row(
          modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "📚 Dynamic Subjects",
            color = Color(0xFFED8936),
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
          )
          
          Button(
            onClick = {
              try {
                val sb = StringBuilder()
                sb.append("Resource checklist for $selectedUniversity - $selectedBranch - $selectedSemester:\n")
                subjects.forEach { (c, n) -> sb.append("- $c $n\n") }
                
                val shareText = sb.toString()
                val intent = Intent(Intent.ACTION_SEND).apply {
                  type = "text/plain"
                  putExtra(Intent.EXTRA_TEXT, shareText)
                }
                context.startActivity(Intent.createChooser(intent, "Share Semester Resources"))
              } catch (e: Exception) {
                e.printStackTrace()
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0x1F9F7AEA)),
            border = BorderStroke(1.dp, neonPurple.copy(alpha = 0.4f)),
            shape = RoundedCornerShape(100.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
            modifier = Modifier.height(28.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text("🔗", fontSize = 11.sp)
              Spacer(modifier = Modifier.width(4.dp))
              Text("Share All", color = neonPurple, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
          }
        }
      }

      // Loading Indicator
      if (loading) {
        item {
          Box(modifier = Modifier.fillMaxWidth().height(120.dp), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = neonCyan)
          }
        }
      } else if (subjects.isEmpty()) {
        item {
          Text("No subjects found.", color = Color.Gray, modifier = Modifier.fillMaxWidth().padding(24.dp), textAlign = TextAlign.Center)
        }
      } else {
        // Subjects List
        items(subjects) { (code, name) ->
          SubjectCard(
            code = code,
            name = name,
            onDownloadClick = { type ->
              val downloadUrl = "http://10.0.2.2:5000/api/study/download?subject=${URLEncoder.encode(name, "UTF-8")}&code=${URLEncoder.encode(code, "UTF-8")}&type=${URLEncoder.encode(type, "UTF-8")}"
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl))
              context.startActivity(intent)
            },
            onShareClick = {
              try {
                val shareText = """
                  Subject Material Resource:
                  📘 Code: $code
                  📖 Title: $name
                  
                  Dynamic Links:
                  📘 *Syllabus:* http://10.0.2.2:5000/api/study/download?subject=${URLEncoder.encode(name, "UTF-8")}&code=${URLEncoder.encode(code, "UTF-8")}&type=Syllabus
                  📝 *10 Years Papers:* http://10.0.2.2:5000/api/study/download?subject=${URLEncoder.encode(name, "UTF-8")}&code=${URLEncoder.encode(code, "UTF-8")}&type=10%20Years%20Papers
                  📙 *Quantum Book:* http://10.0.2.2:5000/api/study/download?subject=${URLEncoder.encode(name, "UTF-8")}&code=${URLEncoder.encode(code, "UTF-8")}&type=Quantum%20Book
                  📓 *Lecture Notes:* http://10.0.2.2:5000/api/study/download?subject=${URLEncoder.encode(name, "UTF-8")}&code=${URLEncoder.encode(code, "UTF-8")}&type=Lecture%20Notes
                  
                  Shared via Multi-University Resources Hub
                """.trimIndent()

                val intent = Intent(Intent.ACTION_SEND).apply {
                  type = "text/plain"
                  putExtra(Intent.EXTRA_TEXT, shareText)
                }
                context.startActivity(Intent.createChooser(intent, "Share Study Materials"))
              } catch (e: Exception) {
                e.printStackTrace()
              }
            }
          )
        }
      }

      // Sidebar Updates Cards
      item {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
          // Updates Card
          Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = cardBg),
            modifier = Modifier
              .fillMaxWidth()
              .border(glassBorder, RoundedCornerShape(20.dp))
          ) {
            Column(modifier = Modifier.padding(16.dp)) {
              Text("🔔 University Updates", color = Color(0xFFE53E3E), fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Spacer(modifier = Modifier.height(8.dp))
              getUniversityUpdates(selectedUniversity, selectedBranch).forEach { (title, desc) ->
                Column(modifier = Modifier.padding(vertical = 6.dp)) {
                  Text(title, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                  Text(desc, color = Color.LightGray.copy(alpha = 0.6f), fontSize = 11.sp)
                }
              }
            }
          }

          // Active Requests Card
          Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = cardBg),
            modifier = Modifier
              .fillMaxWidth()
              .border(glassBorder, RoundedCornerShape(20.dp))
          ) {
            Column(modifier = Modifier.padding(16.dp)) {
              Text("📣 Active Requests", color = Color(0xFFDD6B20), fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Spacer(modifier = Modifier.height(8.dp))
              getActiveRequests(selectedUniversity).forEach { (reqName, status, statusColor) ->
                Row(
                  modifier = Modifier
                    .padding(vertical = 6.dp)
                    .fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text("🙋‍♂️ $reqName", color = Color.White, fontSize = 13.sp)
                  Text(status, color = statusColor, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
              }
            }
          }
        }
      }
    }
  }
}

@Composable
fun FilterDropdown(
  label: String,
  selected: String,
  expanded: Boolean,
  onExpandChange: (Boolean) -> Unit,
  options: List<String>,
  onSelect: (String) -> Unit
) {
  Box(modifier = Modifier.fillMaxWidth()) {
    Column {
      Text(label, color = Color.LightGray.copy(alpha = 0.6f), fontSize = 11.sp)
      Spacer(modifier = Modifier.height(4.dp))
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { onExpandChange(true) }
          .background(Color(0xFF0C1017), RoundedCornerShape(12.dp))
          .border(1.dp, Color(0xFF263248), RoundedCornerShape(12.dp))
          .padding(horizontal = 14.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(selected, color = Color.White, fontSize = 13.sp)
        Text("▼", color = Color.LightGray, fontSize = 10.sp)
      }
    }
    DropdownMenu(
      expanded = expanded,
      onDismissRequest = { onExpandChange(false) },
      modifier = Modifier
        .fillMaxWidth(0.9f)
        .background(Color(0xFF0C1017))
        .border(1.dp, Color(0xFF263248))
    ) {
      options.forEach { option ->
        DropdownMenuItem(
          text = { Text(option, color = Color.White, fontSize = 13.sp) },
          onClick = {
            onSelect(option)
            onExpandChange(false)
          }
        )
      }
    }
  }
}

@Composable
fun SubjectCard(
  code: String,
  name: String,
  onDownloadClick: (String) -> Unit,
  onShareClick: () -> Unit
) {
  val neonCyan = Color(0xFF00D4FF)
  val neonPurple = Color(0xFF9F7AEA)

  Card(
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = Color(0x0CFFFFFF)),
    modifier = Modifier
      .fillMaxWidth()
      .border(BorderStroke(1.dp, Color(0x17FFFFFF)), RoundedCornerShape(16.dp))
  ) {
    Column(modifier = Modifier.padding(14.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          modifier = Modifier.weight(1f),
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Left accent glowing border bar
          Box(
            modifier = Modifier
              .width(4.dp)
              .height(35.dp)
              .background(
                Brush.verticalGradient(listOf(neonCyan, neonPurple)),
                RoundedCornerShape(10.dp)
              )
          )
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = code,
              color = neonPurple,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold
            )
            Text(
              text = name,
              color = Color.White,
              fontSize = 14.sp,
              fontWeight = FontWeight.SemiBold
            )
          }
        }
        
        IconButton(
          onClick = onShareClick,
          modifier = Modifier.size(36.dp)
        ) {
          Text("🔗", color = neonCyan, fontSize = 16.sp)
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        DownloadButton("Syllabus", Modifier.weight(1f)) { onDownloadClick("Syllabus") }
        DownloadButton("Papers", Modifier.weight(1f)) { onDownloadClick("10 Years Papers") }
      }
      Spacer(modifier = Modifier.height(8.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        DownloadButton("Quantum", Modifier.weight(1f)) { onDownloadClick("Quantum Book") }
        DownloadButton("Notes", Modifier.weight(1f)) { onDownloadClick("Lecture Notes") }
      }
    }
  }
}

@Composable
fun DownloadButton(
  text: String,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  val neonCyan = Color(0xFF00D4FF)
  val neonPurple = Color(0xFF9F7AEA)

  Button(
    onClick = onClick,
    colors = ButtonDefaults.buttonColors(containerColor = Color(0x1200D4FF)),
    shape = RoundedCornerShape(50.dp),
    border = BorderStroke(
      width = 1.dp,
      brush = Brush.linearGradient(listOf(neonCyan.copy(alpha = 0.5f), neonPurple.copy(alpha = 0.4f)))
    ),
    contentPadding = PaddingValues(vertical = 6.dp),
    modifier = modifier.height(34.dp)
  ) {
    Text(
      text = text,
      color = Color.White,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 0.5.sp
    )
  }
}

fun getFallbackSubjects(branch: String): List<Pair<String, String>> {
  return when (branch) {
    "ECE" -> listOf(
      Pair("KEC-501", "Integrated Circuits"),
      Pair("KEC-502", "Microprocessor & Microcontroller"),
      Pair("KEC-503", "Digital Signal Processing"),
      Pair("KNC-501", "Constitution of India")
    )
    "IT" -> listOf(
      Pair("KCS-501", "Database Management System (DBMS)"),
      Pair("KCS-503", "Design and Analysis of Algorithms (DAA)"),
      Pair("KIT-501", "Software Engineering"),
      Pair("KCS-502", "Web Technology")
    )
    else -> listOf(
      Pair("KCS-501", "Database Management System (DBMS)"),
      Pair("KCS-503", "Design and Analysis of Algorithms (DAA)"),
      Pair("KCA-501", "Machine Learning Techniques (MLT)"),
      Pair("KCS-055", "Compiler Design"),
      Pair("KNC-501", "Constitution of India (COI)")
    )
  }
}

fun getUniversityUpdates(university: String, branch: String): List<Pair<String, String>> {
  return when (university) {
    "VTU" -> listOf(
      Pair("VTU Exam Schedule 2026", "Semester theory examinations timetable has been officially released."),
      Pair("Syllabus Guidelines ($branch)", "Scheme of studies and syllabus structure updated.")
    )
    "SPPU" -> listOf(
      Pair("SPPU In-Sem Timetable 2026", "Schedules for Pune University in-sem theory assessments are now active."),
      Pair("Curriculum Annexure ($branch)", "Core course credits and practical session guidelines revised.")
    )
    "RGPV" -> listOf(
      Pair("RGPV Odd Sem Exams 2026", "Theory exam online registration portals are now open."),
      Pair("Module Structure ($branch)", "New unit topics added for professional core subjects.")
    )
    "BTEUP" -> listOf(
      Pair("BTEUP Special Back Paper 2026", "Timetables for diploma special carryover papers published."),
      Pair("Diploma Syllabus ($branch)", "Revised guidelines for semester coursework.")
    )
    else -> listOf(
      Pair("AKTU Date Sheet 2026", "Final exams timetable for odd semester theory exams is now live."),
      Pair("Syllabus Updates ($branch)", "Minor revisions in B.Tech Sem 5 neural networks syllabus.")
    )
  }
}

fun getActiveRequests(university: String): List<Triple<String, String, Color>> {
  return when (university) {
    "BTEUP" -> listOf(
      Triple("GPA calculator sheet", "Pending ⏳", Color(0xFFED8936)),
      Triple("BTEUP Diploma EEE Notes", "Fulfilled ✅", Color(0xFF48BB78))
    )
    "VTU" -> listOf(
      Triple("VTU 18CS53 Solved Papers 2023", "Pending ⏳", Color(0xFFED8936)),
      Triple("VTU CSE 5th Sem Notes", "Fulfilled ✅", Color(0xFF48BB78))
    )
    "SPPU" -> listOf(
      Triple("SPPU 310242 Question Script", "Pending ⏳", Color(0xFFED8936)),
      Triple("SPPU CSE Lab Manuals", "Fulfilled ✅", Color(0xFF48BB78))
    )
    else -> listOf(
      Triple("GPA calculator sheet", "Pending ⏳", Color(0xFFED8936)),
      Triple("AKTU KCS-501 Carryover Papers", "Fulfilled ✅", Color(0xFF48BB78))
    )
  }
}
